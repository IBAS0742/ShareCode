package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
)

func main() {
	if args,ok := GetArgs(1, func() {
		fmt.Println("软件名.exe 转换文件")
		fmt.Println("转换文件 的内容规则如下")
		fmt.Println("	1.一行表示一个文件")
		fmt.Println("	2.空行无所谓")
		fmt.Println("	3.允许使用 # 开头作为注释")
		fmt.Println("	4.替换文本用 word 关键字开头")
		fmt.Println("	5.输出位置用关键字 output 开头")
		fmt.Println("	6.如果想放在原来位置，可以用 addName 关键字")
		fmt.Println("		这个关键字表示在原本文件的后缀前加一个标记")
		fmt.Println("	7.如果想替换原文件，可以使用 replace 关键字")
		fmt.Println("	8.规则[5、6、7]如果一起使用按照顺序之会用5，以此类推是6")
		fmt.Println("		也就是不会同时应用 5 6 7 ")
		fmt.Println("")
		fmt.Println("举个例子")
		fmt.Println("# 假设要转换三个文件 a、b、c .xls")
		fmt.Println("c:\\a.xls")
		fmt.Println("c:\\b.xls")
		fmt.Println("c:\\c.xls")
		fmt.Println("")
		fmt.Println("# 假设关键字是 _xlnm.Print_Titles 和 _xlnm.Print_Area")
		fmt.Println("word _xlnm.Print_Titles")
		fmt.Println("word _xlnm.Print_Area")
		fmt.Println("# 假设全部保存到 d 盘目录下")
		fmt.Println("output d:\\")
		fmt.Println("# 假设使用 addName")
		fmt.Println("# 将获得文件名 c:\\a.repair.xls")
		fmt.Println("# 注意下面有一个点")
		fmt.Println("addName .repair")
		fmt.Println("# 假设要替换源文件")
		fmt.Println("replace")
	},[]string{
		`G:\新建文件夹\rep.txt`,
	},true);ok {
		Dear(args[0])
	}
}

func Dear(settingFile string) {
	var output string
	var addName string
	replace := false
	lines := ReadAsFileAsLine(settingFile)
	words := []string{}
	files := []string{}
	for _,line := range lines {
		line = strings.TrimSpace(line)
		if len(line) < 5 {
			continue
		}
		if line[:1] == "#" { } else if strings.ToLower(line[:5]) == "word " {
			words = append(words,line[5:])
		} else if len(line) > 7 && strings.ToLower(line[:7]) == "output " {
			output = line[7:]
		} else if len(line) > 8 && strings.ToLower(line[:8]) == "addname " {
			addName = line[8:]
		} else if len(line) == 7 && strings.ToLower(line[:7]) == "replace" {
			replace = true
		} else {
			if oType,err := PathExistsAndType(line);err != nil {
				fmt.Println(err)
			} else if oType == File {
				files = append(files,line)
			} else if oType == NoExist {
				fmt.Println("文件不存在:",line)
			} else {
				fmt.Println("无法处理文件夹",line)
			}
		}
	}
	if len(words) == 0 {
		fmt.Println("找不到替换关键字")
	} else if len(files) == 0 {
		fmt.Println("找不到需要修复的文件")
	} else {
		eb := EqBar{
			Total:   len(files),
			Percent: 0,
			Size:    50,
		}
		eb.ShowNum()
		if len(output) > 0 {
			for _,file := range files {
				Repair(file,output + filepath.Base(file),words)
				eb.ShowNumPlusOne()
			}
		} else if len(addName) > 0 {
			for _,file := range files {
				ext := path.Ext(file)
				Repair(file,file[:len(file) - len(ext)] + addName + ext,words)
				eb.ShowNumPlusOne()
			}
		} else if replace {
			for _,file := range files {
				Repair(file,file,words)
				eb.ShowNumPlusOne()
			}
		} else {
			fmt.Println("请参照规则[5、6、7]设置其中一项")
		}
	}
}

func Repair(filePath,outFilePath string,replaceWord []string) {
	f, err := os.Open(filePath)
	if err != nil {
		panic(err)
	}

	fSrc, err := ioutil.ReadAll(f)
	f.Close()
	if err != nil {
		panic(err)
	}
	s := string(fSrc)
	for _,w := range replaceWord {
		for i := 0;;i++{
			ind := strings.Index(s,w)
			if ind < 0 {
				break
			}
			s = strings.Replace(s,w,w[:len(w) - 1] + strconv.Itoa(i),1)
		}
	}
	ioutil.WriteFile(outFilePath,[]byte(s),os.ModeAppend)
}

func GetArgs(arglen int, help func(), defultArgs []string, debug bool) ([]string, bool) {
	if debug {
		return defultArgs, true
	}
	arglen++
	if len(os.Args) == arglen {
		retArgs := []string{}
		for i := 1; i < arglen; i++ {
			retArgs = append(retArgs, os.Args[i])
		}
		return retArgs, true
	} else {
		help()
		return nil, false
	}
}

type EqBar struct {
	Total int	// 总的量
	Percent int	// 当前的量
	Size int	// 进度条分为几部分
}
// 显示并加一
func (eb * EqBar)ShowPlusOne() {
	eb.Percent++
	eb.Show()
}
// 显示（这个是以百分数输出的）
func (eb EqBar)Show() {
	str := "[" + eqBar(eb.Size * eb.Percent / eb.Total, eb.Size) + "] " +
		strconv.Itoa(100 * eb.Percent / eb.Total) + "%"
	fmt.Printf("\r%s", str)
}
// 这个也是显示并加一，但是是调用下面这个显示
func (eb * EqBar)ShowNumPlusOne() {
	eb.Percent++
	eb.ShowNum()
}
// 以分数形式显示
func (eb EqBar)ShowNum() {
	cur := eb.Size * eb.Percent / eb.Total
	str := "[" + eqBar(cur, eb.Size) + "] " +
		strconv.Itoa(eb.Percent) + "/" + strconv.Itoa(eb.Total)
	fmt.Printf("\r%s", str)
}
func eqBar(count, size int) string {
	str := ""
	for i := 0; i < size; i++ {
		if i < count {
			str += "="
		} else {
			str += " "
		}
	}
	return str
}

func ReadAsFileAsLine(filename string) []string {
	var lines []string
	if file, err := os.Open(filename); err != nil {
		panic(err)
	} else {
		defer file.Close()
		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := scanner.Text()
			lines = append(lines, line)
		}
		return lines
	}
}

const (
	File = -1
	NoExist = 0
	Dir = 1
)
// -1 是文件，1 是文件夹，0表示不存在
func PathExistsAndType(path string) (int, error) {
	s, err := os.Stat(path)
	if err == nil {
		if s.IsDir() {
			return 1,nil
		} else {
			return -1, nil
		}
	}
	if os.IsNotExist(err) {
		return 0, nil
	}
	return 0, err
}