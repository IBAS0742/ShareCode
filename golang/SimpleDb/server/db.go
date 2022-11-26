package server

import (
	"database/sql"
	"errors"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
	"strconv"
	"strings"
)

type Db struct {
	db * sql.DB
}

func (db * Db)OpenDb(dbPath string,createSqls []string,info bool)  {
	var err error
	fmt.Println("dbPath => " + dbPath)
	db.db,err = sql.Open("sqlite3", dbPath)
	if err != nil {
		panic(err)
	}
	for _,cs := range createSqls {
		err := db.ExecuteSqlNotReturn(cs,info)
		if err != nil {
			panic(err)
		}
	}
}

//func (db * Db)ExecuteSql(sql string) {
//
//}

func (db * Db)ExecuteSqlNotReturn(sql string,info bool) error {
	if info {
		fmt.Println(sql)
	}
	statement,err := db.db.Prepare(sql)
	if statement != nil {
		statement.Exec()
		defer statement.Close()
		return nil
	} else {
		//fmt.Println("sql fail")
		if err != nil {
			return err
		}
		return errors.New("sql execute fail")
	}
}
func (db * Db)ExecuteWithResult(sql string,info bool) (*sql.Rows,error) {
	if info {
		fmt.Println(sql)
	}
	rows,err_ := db.db.Query(sql)
	return rows,err_
}

func buildObj(arr []string,field []string) string {
	c := []string{}
	for i := 0;i < len(arr);i++ {
		arr[i] = strings.Replace(arr[i],"\n"," ",-1)
		arr[i] = strings.Replace(arr[i],"\r"," ",-1)
		arr[i] = strings.Replace(arr[i],"\\\\","__",-1)
		arr[i] = strings.Replace(arr[i],"\"","\\\"",-1)
		c = append(c,`"` + field[i] + `":"` + arr[i] + `"`)
	}
	return `{` + strings.Join(c,",") + `}`
}
func getRow2Json(columns []string) func(rows * sql.Rows) []string {
	r2j := row2Json1
	if len(columns) == 1 {
		r2j = row2Json1
	}else if len(columns) == 2 {
		r2j = row2Json2
	}else if len(columns) == 3 {
		r2j = row2Json3
	}else if len(columns) == 4 {
		r2j = row2Json4
	}else if len(columns) == 5 {
		r2j = row2Json5
	}else if len(columns) == 6 {
		r2j = row2Json6
	}else if len(columns) == 7 {
		r2j = row2Json7
	}else if len(columns) == 8 {
		r2j = row2Json8
	}else if len(columns) == 9 {
		r2j = row2Json9
	}else if len(columns) == 10 {
		r2j = row2Json10
	}else if len(columns) == 11 {
		r2j = row2Json11
	}else if len(columns) == 12 {
		r2j = row2Json12
	}else if len(columns) == 13 {
		r2j = row2Json13
	}else if len(columns) == 14 {
		r2j = row2Json14
	}else if len(columns) == 15 {
		r2j = row2Json15
	}else if len(columns) == 16 {
		r2j = row2Json16
	}else if len(columns) == 17 {
		r2j = row2Json17
	}else if len(columns) == 18 {
		r2j = row2Json18
	}else if len(columns) == 19 {
		r2j = row2Json19
	}else if len(columns) == 20 {
		r2j = row2Json20
	}else if len(columns) == 21 {
		r2j = row2Json21
	}else if len(columns) == 22 {
		r2j = row2Json22
	}else if len(columns) == 23 {
		r2j = row2Json23
	}else if len(columns) == 24 {
		r2j = row2Json24
	}else if len(columns) == 25 {
		r2j = row2Json25
	}else if len(columns) == 26 {
		r2j = row2Json26
	}
	return r2j
}
// 自动生成代码如下
//s = 'abcdefghijklmnopqrstuvwxyz'.split('')
//ret = [];
//ifs = [];
//buildFn = (ind,ss) => {
//return `func row2Json${ind}(rows * sql.Rows) []string {
//	var ${ss.join(',')} string
//	rows.Scan(${ss.map(_ => `&${_}`).join(',')})
//	return []string{${ss.join(',')}}
//}`
//}
//buildIf = ind => {
//return `if len(columns) == ${ind} {
//		r2j = row2Json${ind}
//	}`
//}
//for (var i = 0;i < s.length;i++) {
//ret.push(buildFn(i + 1,s.slice(0,i + 1)))
//ifs.push(buildIf(i + 1))
//}
//console.log(ret.join('\r\n'))
//console.log(ifs.join('else '))
func Row2Json(rows * sql.Rows,columns []string) string {
	r2j := getRow2Json(columns)
	ret := []string{}
	for rows.Next() {
		arr := r2j(rows)
		ret = append(ret,buildObj(arr,columns))
	}
	return "[" + strings.Join(ret,",") + "]"
}
func BuildStrByRows(rows * sql.Rows,columns []string,fn func([]string)) {
	r2j := getRow2Json(columns)
	for rows.Next() {
		arr := r2j(rows)
		fn(arr)
	}
}
/*
 * format = "{0} {1}"
 * arr = ["a","b"]
 * return "a b"
 */
func BuildStrByFormat(format string,arr []string) string {
	for ind,a := range arr {
		format = strings.ReplaceAll(format,"{" + strconv.Itoa(ind) + "}",a)
	}
	return format
}
func row2Json1(rows * sql.Rows) []string {
	var a string
	rows.Scan(&a)
	return []string{a}
}
func row2Json2(rows * sql.Rows) []string {
	var a,b string
	rows.Scan(&a,&b)
	return []string{a,b}
}
func row2Json3(rows * sql.Rows) []string {
	var a,b,c string
	rows.Scan(&a,&b,&c)
	return []string{a,b,c}
}
func row2Json4(rows * sql.Rows) []string {
	var a,b,c,d string
	rows.Scan(&a,&b,&c,&d)
	return []string{a,b,c,d}
}
func row2Json5(rows * sql.Rows) []string {
	var a,b,c,d,e string
	rows.Scan(&a,&b,&c,&d,&e)
	return []string{a,b,c,d,e}
}
func row2Json6(rows * sql.Rows) []string {
	var a,b,c,d,e,f string
	rows.Scan(&a,&b,&c,&d,&e,&f)
	return []string{a,b,c,d,e,f}
}
func row2Json7(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g)
	return []string{a,b,c,d,e,f,g}
}
func row2Json8(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h)
	return []string{a,b,c,d,e,f,g,h}
}
func row2Json9(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i)
	return []string{a,b,c,d,e,f,g,h,i}
}
func row2Json10(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i,j string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i,&j)
	return []string{a,b,c,d,e,f,g,h,i,j}
}
func row2Json11(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i,j,k string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i,&j,&k)
	return []string{a,b,c,d,e,f,g,h,i,j,k}
}
func row2Json12(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i,j,k,l string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i,&j,&k,&l)
	return []string{a,b,c,d,e,f,g,h,i,j,k,l}
}
func row2Json13(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i,j,k,l,m string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i,&j,&k,&l,&m)
	return []string{a,b,c,d,e,f,g,h,i,j,k,l,m}
}
func row2Json14(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i,j,k,l,m,n string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i,&j,&k,&l,&m,&n)
	return []string{a,b,c,d,e,f,g,h,i,j,k,l,m,n}
}
func row2Json15(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i,&j,&k,&l,&m,&n,&o)
	return []string{a,b,c,d,e,f,g,h,i,j,k,l,m,n,o}
}
func row2Json16(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i,&j,&k,&l,&m,&n,&o,&p)
	return []string{a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p}
}
func row2Json17(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i,&j,&k,&l,&m,&n,&o,&p,&q)
	return []string{a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q}
}
func row2Json18(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i,&j,&k,&l,&m,&n,&o,&p,&q,&r)
	return []string{a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r}
}
func row2Json19(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i,&j,&k,&l,&m,&n,&o,&p,&q,&r,&s)
	return []string{a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s}
}
func row2Json20(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i,&j,&k,&l,&m,&n,&o,&p,&q,&r,&s,&t)
	return []string{a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t}
}
func row2Json21(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i,&j,&k,&l,&m,&n,&o,&p,&q,&r,&s,&t,&u)
	return []string{a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u}
}
func row2Json22(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i,&j,&k,&l,&m,&n,&o,&p,&q,&r,&s,&t,&u,&v)
	return []string{a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v}
}
func row2Json23(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i,&j,&k,&l,&m,&n,&o,&p,&q,&r,&s,&t,&u,&v,&w)
	return []string{a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w}
}
func row2Json24(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i,&j,&k,&l,&m,&n,&o,&p,&q,&r,&s,&t,&u,&v,&w,&x)
	return []string{a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x}
}
func row2Json25(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i,&j,&k,&l,&m,&n,&o,&p,&q,&r,&s,&t,&u,&v,&w,&x,&y)
	return []string{a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y}
}
func row2Json26(rows * sql.Rows) []string {
	var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z string
	rows.Scan(&a,&b,&c,&d,&e,&f,&g,&h,&i,&j,&k,&l,&m,&n,&o,&p,&q,&r,&s,&t,&u,&v,&w,&x,&y,&z)
	return []string{a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z}
}