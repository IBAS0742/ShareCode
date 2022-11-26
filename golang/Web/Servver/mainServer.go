package Server

import (
	"fmt"
	"go-geo/Web/Library/output/Aimport"
	"net/http"
	"strconv"
	"time"
)

type MainServer struct {
	Port int
}

func (ms *MainServer) RunServer() {
	srv := &http.Server{
		Addr:           ":" + strconv.Itoa(ms.Port),
		Handler:        nil,
		ReadTimeout:    time.Duration(5) * time.Minute,
		WriteTimeout:   time.Duration(5) * time.Minute,
		MaxHeaderBytes: 1 << 20,
	}
	var err error
	Aimport.Import()
	//statikFS, err := fs.New()
	//http.Handle("/leaflet171/", http.StripPrefix("/leaflet171/", http.FileServer(statikFS)))
	fmt.Println("【浏览/view】 http://localhost:" + strconv.Itoa(ms.Port))
	err = srv.ListenAndServe()
	if err != nil {
		fmt.Println(err)
		return
	}
}
