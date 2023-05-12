package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

var (
	config Config
	db     Db
	info   bool
)

func CreateServer(config_ Config, info_ bool) {
	db = Db{}
	info = info_
	config = config_
	db.OpenDb(config.DbPath, config.Sqls, info)
	http.HandleFunc("/api", action)
	http.Handle(config.StaticUrl, http.StripPrefix(config.StaticUrl, http.FileServer(http.Dir(config.StaticPath))))
	srv := &http.Server{
		Addr:           config.Port,
		Handler:        nil,
		ReadTimeout:    time.Duration(5) * time.Minute,
		WriteTimeout:   time.Duration(5) * time.Minute,
		MaxHeaderBytes: 1 << 20,
	}
	fmt.Println("http://localhost" + config.Port)
	fmt.Println("view : http://localhost" + config.Port + config.StaticUrl)
	//Console.RunBatFile("http://localhost" + config.Port)
	err := srv.ListenAndServe()
	if err != nil {
		fmt.Println(err)
		return
	}
}

type Parmas struct {
	Method string
	Array  bool
	Params []string
}

func (p Parmas) toString() string {
	ret := "method = " + p.Method + "\n"
	for i, pa := range p.Params {
		ret += "p[" + strconv.Itoa(i) + "] = {" + pa + "}"
	}
	return ret
}
func action(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")               //允许访问所有域
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type")   //header的类型
	w.Header().Set("content-type", "application/json;charset=utf-8") //返回数据格式是json
	p := Parmas{
		Array: false,
	}
	var err error
	err = json.NewDecoder(r.Body).Decode(&p)
	if info {
		fmt.Println(p.toString())
	}
	if err == nil {
		if p.Method == "_sys_" {
			fmt.Fprintf(w, `
fetch('http://localhost`+config.Port+`/api',{
    method: 'post',
    body: JSON.stringify({
        Method: 'api_name',
        Params: [parameter_list]
    })
}).then(_=>_.json()).then(console.log)`)
		}
		api, err_ := getApi(p.Method)
		if err_ != nil {
			err = err_
		} else {
			sqlStr, err__ := buildSqlByApis(api, p)
			if info {
				fmt.Println()
				fmt.Println(sqlStr)
			}
			if err__ != nil {
				err = err__
			} else {
				if len(api.Return) != 0 {
					rows, err_ := db.ExecuteWithResult(sqlStr[0], info)
					if err_ != nil {
						err = err_
					} else {
						//jsonStr,_ := json.MarshalIndent(rows,"","")
						content := string(Row2Json(rows, api.Return))
						replace := strings.Replace(content, "\"", "\\\"", -1)
						fmt.Fprint(w, `{"err":"","content":"`+replace+`"}`)
						return
					}
				} else {
					var err__ error
					for ind, s := range sqlStr {
						fmt.Println(ind)
						fmt.Println(s)
						err__ = db.ExecuteSqlNotReturn(s, info)
						if err__ != nil {
							err = err__
						}
					}
					if err__ == nil {
						fmt.Fprint(w, `{"err":""}`)
						return
					}
				}
			}
		}
	}
	if err != nil {
		fmt.Println(err)
		fmt.Fprintf(w, `{"err": "`+err.Error()+`"}}`)
	}
}

// 从 config.apis 中找到那个 api
func getApi(method string) (Api, error) {
	api_ := Api{
		Name: "____",
	}
	for _, api := range config.Apis {
		if api.Name == method {
			api_ = api
		}
	}
	if api_.Name == "____" {
		return api_, errors.New("method can not find in apis")
	} else {
		return api_, nil
	}
}
func buildSqlByApis(api Api, parmas Parmas) ([]string, error) {
	var err error
	s := []string{}
	if parmas.Array {
		var strs = []string{}
		for _, p := range parmas.Params {
			var ts = api.Sql
			json.Unmarshal([]byte(p), &strs)
			for ind, pn := range api.Param {
				ts = strings.Replace(ts, "{"+pn+"}", strings.ReplaceAll(strs[ind], "\"", "\"\""), -1)
			}
			s = append(s, ts)
		}
	} else {
		s = append(s, "")
		if len(api.Param) <= len(parmas.Params) {
			s[0] = api.Sql
			for ind, pn := range api.Param {
				s[0] = strings.Replace(s[0], "{"+pn+"}", strings.ReplaceAll(parmas.Params[ind], "\"", "\"\""), -1)
			}
		} else {
			err = errors.New("param is not match")
		}
	}
	return s, err
}
