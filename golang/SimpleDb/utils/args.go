package utils

import (
	"fmt"
	"strings"
)

type argDear struct {
	str string
	dear func(string,* Arg)
}

var (
	argName = [] argDear {
		{
			str: "--mode=",
			dear: func(s string,arg * Arg) {
				s = strings.ToLower(s)
				if s != "web" && s != "execute" {
					panic("--mode=web/execute")
				}
				arg.Mode = s
			},
		},
		{
			str: "--config=",
			dear: func(s string,arg * Arg) {
				arg.ConfigPath = s
			},
		},
		{
			str: "--info",
			dear: func(s string,arg * Arg) {
				arg.Info = true
			},
		},
		{
			str: "--execute=",
			dear: func(s string,arg * Arg) {
				arg.Execute = s
			},
		},
		{
			str: "--dbpath=",
			dear: func(s string,arg * Arg) {
				arg.DbPath = s
			},
		},
	}
)

type Arg struct {
	Mode string
	ConfigPath string
	Info bool
	Execute string
	DbPath string
}

func help() {
	fmt.Println("exe --mode=web/execute --config=c:\\a.json [--info] [--execute=apiName] [--dbpath=a.db]")
}

func (a Arg)checkArg() {
	if a.ConfigPath == "" {
		panic("--config required")
	}
	if a.Mode == "execute" {
		if a.Execute == "" {
			panic("when [--config=execute] ; --execute required")
		}
	}
}

func Args(args []string) Arg {
	help()
	arg := Arg{}
	for ind,a := range args {
		sa := strings.ToLower(a)
		fmt.Println(ind,"\t",a)
		for _,aa := range argName {
			if len(a) > len(aa.str) && sa[:len(aa.str)] == aa.str {
				aa.dear(a[len(aa.str):],&arg)
			}
		}
	}
	arg.checkArg()
	return arg
}
