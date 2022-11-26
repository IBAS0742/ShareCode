package main

import (
	"os"
	"path/filepath"
	"sunibas.cn/awesomProject/SimpleDb/server"
	"sunibas.cn/awesomProject/SimpleDb/utils"
)

func main() {
	exePath, _ := filepath.Split(os.Args[0])
	args := utils.Args(os.Args[1:])
	config := server.DearWithConfig(args.ConfigPath,exePath,args.Mode)
	if args.DbPath != "" {
		config.DbPath = args.DbPath
	}
	if args.Mode == "web" {
		start(config,args.Info)
	} else if args.Mode == "execute" {
		execute(config,args.Execute,args.Info)
	}

	//execute("write_recordFS0")
}

func start(config server.Config,info bool)  {
	server.CreateServer(config,info)
}

func execute(config server.Config,executeApi string,info bool)  {
	utils.Execute(config,executeApi,info)
}
