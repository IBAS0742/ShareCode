package utils


import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"
	"sunibas.cn/awesomProject/SimpleDb/server"
	"time"
)

var (
	config server.Config
	db server.Db
	info bool
)

// 从 config.apis 中找到那个 api
func getApi(method string) (server.Api,error) {
	db = server.Db{}
	db.OpenDb(config.DbPath,config.Sqls,info)
	api_ := server.Api{
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
// D:\Temp\test\storkFS_tmp.db
func Execute(config_ server.Config,apiName string,info_ bool) {
	start := time.Now()
	db = server.Db{}
	info = info_
	config = config_

	api,err := getApi(apiName)
	if err != nil {
		panic(err)
	}
	// ```name``` 必须有 ```write_``` ```read_``` ```execute_```
	if len(api.Name) > len("write_") && api.Name[:len("write_")] == "write_" {
		writeOut(api)
	} else if len(api.Name) > len("execute_") && api.Name[:len("execute_")] == "execute_" {
		execute(api)
	} else {
		fmt.Println("api.Name != write/execute")
	}
	elapsed := time.Since(start)
	fmt.Println("执行时间：", elapsed)
}

func writeOut(api server.Api)  {
	//{
	//	"name": "write_recordFS",
	//	"return": [
	//		"id","symbol","time","timeStamp","amount","percent","chg","avg_price","volume","current"
	//	],
	//	"param": [
	//		"D:\\Temp\\test\\out.json",
	//		"insert or ignore into recordFS(id,symbol,time,timeStamp,amount,percent,chg,avg_price,volume,current) values(\"{0}\",\"{1}\",\"{2}\",\"{3}\",\"{4}\",\"{5}\",\"{6}\",\"{7}\",\"{8}\",\"{9}\");"
	//	],
	//	"sql": "select * from recordFS;",
	//	"desc": "-apis 获取所有的表名\r"
	//},
	if len(api.Param) != 2 || len(api.Return) == 0 {
		panic("api.Param === 2 and api.Return > 0")
	}
	rows,err_ := db.ExecuteWithResult(api.Sql,info)
	if err_ != nil {
		panic(err_)
	}
	file, err := os.Create(api.Param[0])
	defer file.Close()
	if err != nil {
		panic(err)
	}
	listCount := 0
	server.BuildStrByRows(rows,api.Return, func(arr []string) {
		str := server.BuildStrByFormat(api.Param[1],arr)
		n, err := file.Write([]byte(str))
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		if n != len(str) {
			fmt.Println("failed to write data")
			os.Exit(1)
		}
		listCount++
	})
	fmt.Println("record length is ",listCount)
}

func execute(api server.Api)  {
	splitFn := func(s,sp string) []string {
		return strings.Split(s,sp)
	}
	lines2Sql := func(lines []string) string {
		return strings.Join(lines,"")
	}
	sqlLen := 100
	if len(api.Param) < 2 {
		panic("len(api.Param) = 2 or 3 , but now is " + strconv.Itoa(len(api.Param)))
	}
	if len(api.Param) >= 3 {
		sqlLen,_ = strconv.Atoi(api.Param[2])
	}
	if len(api.Param) == 4 {
		lines2Sql = func(lines []string) string {
			line := strings.Join(lines,"")
			return strings.Replace(line,api.Param[3],",",-1)
		}
	}
	file, err := os.OpenFile(api.Param[0], os.O_RDWR, 0666)
	if err != nil {
		fmt.Println("Open file error!", err)
		return
	}
	defer file.Close()
	buf := bufio.NewReader(file)
	lines := []string{}
	if api.Param[1] == "" {
		splitFn = func(s, sp string) []string {
			return []string{s}
		}
	}
	for {
		line, err := buf.ReadString('\n')
		line = strings.TrimSpace(line)
		lines = append(lines,server.BuildStrByFormat(api.Sql,splitFn(line,api.Param[1])))
		if err != nil {
			if err == io.EOF {
				fmt.Println("File read ok!")
				break
			}
		}
		if len(lines) == sqlLen {
			db.ExecuteSqlNotReturn(lines2Sql(lines),info)
			lines = []string{}
		}
	}
	if len(lines) != 0 {
		db.ExecuteSqlNotReturn(lines2Sql(lines),info)
		lines = []string{}
	}
}


