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
	db Db
	info bool
)

func CreateServer(config_ Config,info_ bool)  {
	db = Db{}
	info = info_
	config = config_
	db.OpenDb(config.DbPath,config.Sqls,info)
	http.HandleFunc("/api", action)
	http.Handle(config.StaticUrl, http.StripPrefix(config.StaticUrl,http.FileServer(http.Dir(config.StaticPath))))
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
	Params []string
}
func (p Parmas)toString() string {
	ret := "method = " + p.Method + "\n"
	for i,pa := range p.Params {
		ret += "p[" + strconv.Itoa(i) + "] = {" + pa + "}"
	}
	return ret
}
func action(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")             //允许访问所有域
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type") //header的类型
	w.Header().Set("content-type", "application/json")             //返回数据格式是json
	var p Parmas
	var err error
	err = json.NewDecoder(r.Body).Decode(&p)
	if info {
		fmt.Println(p.toString())
	}
	if err == nil {
		if p.Method == "_sys_" {
			fmt.Fprintf(w,`
fetch('http://localhost` + config.Port + `/api',{
    method: 'post',
    body: JSON.stringify({
        Method: 'api_name',
        Params: [parameter_list]
    })
}).then(_=>_.json()).then(console.log)`)
		}
		api,err_ := getApi(p.Method)
		if err_ != nil {
			err = err_
		} else {
			sqlStr,err__ := buildSqlByApis(api,p)
			if err__ != nil {
				err = err__
			} else {
				if len(api.Return) != 0 {
					rows,err_ := db.ExecuteWithResult(sqlStr,info)
					if err_ != nil {
						err = err_
					} else {
						//jsonStr,_ := json.MarshalIndent(rows,"","")
						content := string(Row2Json(rows,api.Return))
						fmt.Fprintf(w, `{"err":"","content":"` + strings.Replace(content,"\"","\\\"",-1) + `"}`)
						return
					}
				} else {
					fmt.Println(sqlStr)
					err__ := db.ExecuteSqlNotReturn(sqlStr,info)
					if err__ != nil {
						err = err__
					} else {
						fmt.Fprintf(w, `{"err":""}`)
						return
					}
				}
			}
		}
	}
	if err != nil {
		fmt.Println(err)
		fmt.Fprintf(w, `{"err": "` + err.Error() + `"}}`)
	}
}

// 从 config.apis 中找到那个 api
func getApi(method string) (Api,error) {
	api_ := Api{
		Name: "____",
	}
	for _,api := range config.Apis {
		if api.Name == method {
			api_ = api
		}
	}
	if api_.Name == "____" {
		return api_,errors.New("method can not find in apis")
	} else {
		return api_,nil
	}
}
func buildSqlByApis(api Api,parmas Parmas) (string,error) {
	var err error
	s := ""
	if len(api.Param) <= len(parmas.Params) {
		s = api.Sql
		for ind,pn := range api.Param {
			s = strings.Replace(s,"{" + pn + "}",strings.ReplaceAll(parmas.Params[ind],"\"","\"\""),-1)
		}
	} else {
		err = errors.New("param is not match")
	}
	return s,err
}
