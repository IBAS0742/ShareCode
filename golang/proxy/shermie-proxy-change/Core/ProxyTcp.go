package Core

import (
	"Go-Test/shermie-proxy-change/Log"
	"errors"
	"io"
	"net"
)

const TcpServer = "server"
const TcpClient = "client"

type ProxyTcp struct {
	ConnPeer
	target net.Conn
	port   string
}

func (i *ProxyTcp) Handle() {
	defer func() {
		i.ConnPeer.conn.Close()
	}()
	tcpAddr, err := net.ResolveTCPAddr("tcp", i.server.proxy)
	if err != nil {
		Log.Log.Println("解析tcp代理目标地址错误：" + err.Error())
		return
	}
	conn, err := net.DialTCP("tcp", nil, tcpAddr)
	defer func() {
		_ = conn.Close()
	}()
	if err != nil {
		Log.Log.Println("连接tcp代理目标地址错误：" + err.Error())
		return
	}
	if !i.server.nagle {
		_ = conn.SetNoDelay(false)
	}
	stop := make(chan error, 2)
	go i.Transport(stop, i.ConnPeer.conn, conn, TcpClient)
	go i.Transport(stop, conn, i.ConnPeer.conn, TcpServer)
	err = <-stop
	Log.Log.Println("转发tcp数据错误：" + err.Error())
}

func (i *ProxyTcp) Transport(out chan<- error, originConn net.Conn, targetConn net.Conn, role string) {
	buff := make([]byte, 4096)
	for {
		readLen, err := originConn.Read(buff)
		if readLen > 0 {
			buff = buff[0:readLen]
			if role == TcpServer {
				i.server.OnTcpServerStreamEvent(buff)
			} else {
				i.server.OnTcpClientStreamEvent(buff)
			}
			writeLen, err := targetConn.Write(buff)
			if writeLen < 0 || readLen < writeLen {
				writeLen = 0
				if err == nil {
					out <- errors.New("tcp代理写入目标服务器错误-1")
					break
				}
			}
			if readLen != writeLen {
				out <- errors.New("tcp代理写入目标服务器错误-2")
				break
			}
		}
		if err != nil {
			if err != io.EOF {
				out <- errors.New("tcp代理读取客户端数据错误-1")
			}
			break
		}
		buff = buff[:]
	}
}
