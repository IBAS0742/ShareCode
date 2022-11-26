package main

import "go-geo/Web/Server"

func main() {
	s := Server.MainServer{
		Port: 8088,
	}
	s.RunServer()
}
