package server

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"strings"
)

func ReadAll(filename string) string {
	f, err := ioutil.ReadFile(filename)
	if err != nil {
		fmt.Println("read fail", err)
	}
	return string(f)
}

type Config struct {
	DbPath     string   `json:"db_path"`
	Sqls       []string `json:"sqls"`
	Apis       []Api    `json:"apis"`
	Port       string   `json:"port"`
	StaticPath string   `json:"static_path"`
	StaticUrl  string   `json:"static_url"`
}

func startWith(str,sw string) bool {
	if len(str) >= len(sw) && str[:len(sw)] == sw {
		return true
	}
	return false
}

func removeEmptyString(strarr []string) []string  {
	if len(strarr) != 0 {
		ret := []string{}
		for _,r := range strarr {
			if r != "" {
				ret = append(ret, r)
			}
		}
		return ret
	} else {
		return strarr
	}
}

func checkConfigPathExists(path string) bool {
	s,e := os.Stat(path)
	if e != nil {
		panic(e)
	}
	if os.IsNotExist(e) {
		fmt.Println("config path is dir ? ")
		return false
	} else {
		return !s.IsDir()
	}
}

func DearWithConfig(config,exePath string,mode string) Config {
	c := Config{
		DbPath: "",
		Apis: []Api{},
		Sqls: []string{},
		Port: "",
	}
	if config[len(config) - 4:] == "json" {
		err := json.Unmarshal([]byte(ReadAll(config)), &c)
		if err != nil {
			panic(err)
		}
		return c
	}
	if !checkConfigPathExists(config) {
		config = path.Join(exePath,config)
		if !checkConfigPathExists(config) {
			panic("config path is not exist")
		}
	}
	lines := strings.Split(ReadAll(config),"\n")
	for i := 0;i < len(lines);i++ {
		if len(lines[i]) < 3 {
			continue
		} else if lines[i][0] == '#' {
			continue
		} else {
			tl := strings.TrimSpace(lines[i])
			if tl == "-staticPath" {
				i++
				c.StaticPath = strings.TrimSpace(lines[i])
			} else if tl == "-staticUrl" {
				i++
				c.StaticUrl = strings.TrimSpace(lines[i])
				if len(c.StaticUrl) == 0 || c.StaticUrl == "/" {
					c.StaticUrl = "/views"
					fmt.Println("staticUrl can not be empty or '/'")
				}
				if c.StaticUrl[0] != '/' {
					c.StaticUrl = "/" + c.StaticUrl
				}
				//if c.StaticUrl[len(c.StaticPath) - 1] != '/' {
				//	c.StaticUrl = c.StaticUrl + "/"
				//}
			}else if tl == "-dbpath" {
				i++
				c.DbPath = strings.TrimSpace(lines[i])
			} else if tl == "-sqls" {
				i++
				c.Sqls = append(c.Sqls,strings.TrimSpace(lines[i]))
			} else if tl == "-port" {
				i++
				c.Port = ":" + strings.TrimSpace(lines[i])
			} else if len(lines[i]) >= len("-apis") && lines[i][0:len("-apis")] == "-apis" {
				i++
				ps := strings.Split(strings.TrimSpace(lines[i + 2])," ")
				okps := []string{}
				for i := 0;i < len(ps);i++ {
					okps_ := strings.TrimSpace(ps[i])
					if okps_ != "" {
						okps = append(okps,okps_)
					}
				}
				api := Api{
					Desc: lines[i - 1],
					Name: strings.TrimSpace(lines[i]),
					Return: strings.Split(strings.TrimSpace(lines[i + 1])," "),
					Param: okps,
					Sql: strings.TrimSpace(lines[i + 3]),
				}
				i+= 4
				api.Param = removeEmptyString(api.Param)
				api.Return = removeEmptyString(api.Return)
				c.Apis = append(c.Apis,api)
			}
		}
	}

	tmpApis := []Api{}
	if mode == "web" {
		for _,api := range c.Apis {
			// ```write_```  ```execute_```
			if startWith(api.Name,"write_") || startWith(api.Name,"execute_") {
				tmpApis = append(tmpApis,api)
			}
		}
		c.Apis = tmpApis
		c.Apis = AddDefaultWebApi(c.Apis)
	} else {
		for _,api := range c.Apis {
			// ```write_```  ```execute_```
			if !startWith(api.Name,"write_") && !startWith(api.Name,"execute_") {
				tmpApis = append(tmpApis,api)
			}
		}
		c.Apis = tmpApis
	}

	//jsonStr,_ := json.MarshalIndent(c,"","")
	//FileOp.WriteWithIOUtilByte("tmp.json",jsonStr)
	return c
}
