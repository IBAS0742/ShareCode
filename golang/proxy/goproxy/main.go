package main

import (
	"Go-Test/goproxy/Config"
	"Go-Test/shermie-proxy-change/Core"
	"Go-Test/shermie-proxy-change/Core/Websocket"
	"Go-Test/shermie-proxy-change/Log"
	"flag"
	"net/http"
	"os"
)

func init() {
	// 初始化日志
	Log.NewLogger().Init()
	// 初始化根证书
	err := Core.NewCertificate().Init()
	if err != nil {
		Log.Log.Println("初始化根证书失败：" + err.Error())
		return
	}
}

func main() {
	//fmt.Println(len(os.Args))
	var config Config.Config
	if len(os.Args) == 2 {
		config = Config.InitConfig(os.Args[1])
	} else {
		config = Config.InitConfig("D:\\codes\\Go-Test\\goproxy\\config.json")
	}

	//port := flag.String("port", "9090", "listen port")
	//nagle := flag.Bool("nagle", true, "connect remote use nagle algorithm")
	//proxy := flag.String("proxy", "0", "tcp prxoy remote host")
	flag.Parse()
	if config.Port == "0" {
		Log.Log.Fatal("port required")
		return
	}
	// 启动服务
	s := Core.NewProxyServer(config.Port, config.Nagle, config.Proxy)
	// 注册http客户端请求事件函数
	s.OnHttpRequestEvent = func(request *http.Request) {

	}
	// 注册http服务器响应事件函数
	s.OnHttpResponseEvent = func(response *http.Response, body []byte) []byte {
		//contentType := response.Header.Get("Content-Type")
		//var reader io.Reader
		//if strings.Contains(contentType, "json") {
		//	reader = bufio.NewReader(response.Body)
		//	if header := response.Header.Get("Content-Encoding"); header == "gzip" {
		//		reader, _ = gzip.NewReader(response.Body)
		//	}
		//	body, _ := io.ReadAll(reader)
		//	Log.Log.Println("HttpResponseEvent：" + string(body))
		//}
		uri := response.Request.RequestURI
		//if uri == "http://172.20.109.39:8099/views/test.html" {
		//	fmt.Println("inj")
		//	cLength, _ := strconv.Atoi(response.Header.Get("Content-Length"))
		//	fmt.Println("Content-Length = " + strconv.Itoa(cLength))
		//	//response.Header.Set("Content-Length", strconv.Itoa(cLength+len("<script>alert('inj')</script>")))
		//	//response.Write(bytes.NewBuffer([]byte("<script>alert('inj')</script>")))
		//	//response.Body.Close()
		//	body = append(body, []byte("<script>alert('inj')</script>")...)
		//} else if uri == "http://zky.sass.elstp.cn/make/Field/Badminton/?t=Reserve&field_id=11d56035-9564-7470-8dcc-860cb06644c12&day=2022-12-16&time_id=f3f7870a-a4d4-1e14-de22-21ba9a283ad12&type=afb16847-b58c-b294-1ec1-284c9f3bf933" {
		//	fmt.Println("inj")
		//	cLength, _ := strconv.Atoi(response.Header.Get("Content-Length"))
		//	fmt.Println("Content-Length = " + strconv.Itoa(cLength))
		//	//response.Header.Set("Content-Length", strconv.Itoa(cLength+len("<script>alert('inj')</script>")))
		//	//response.Write(bytes.NewBuffer([]byte("<script>alert('inj')</script>")))
		//	//response.Body.Close()
		//	body = append(body, []byte(content1)...)
		//}

		if ind, ok := config.GetItem(uri); ok {
			return config.UpdateBody(body, ind)
		}

		return body
	}
	// 注册socket5服务器推送消息事件函数
	s.OnSocket5ResponseEvent = func(message []byte) {
		Log.Log.Println("Socket5ResponseEvent：" + string(message))
	}
	// 注册socket5客户端推送消息事件函数
	s.OnSocket5RequestEvent = func(message []byte) {
		Log.Log.Println("Socket5RequestEvent：" + string(message))
	}
	// 注册ws客户端推送消息事件函数
	s.OnWsRequestEvent = func(msgType int, message []byte, target *Websocket.Conn, resolve Core.ResolveWs) error {
		Log.Log.Println("WsRequestEvent：" + string(message))
		return target.WriteMessage(msgType, message)
	}
	// 注册w服务器推送消息事件函数
	s.OnWsResponseEvent = func(msgType int, message []byte, client *Websocket.Conn, resolve Core.ResolveWs) error {
		Log.Log.Println("WsResponseEvent：" + string(message))
		return resolve(msgType, message, client)
	}
	_ = s.Start()
}
