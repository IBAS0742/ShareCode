package main

import (
	"io/ioutil"
	"os"
	"strconv"
	"strings"
)

func main() {
	filePath := `G:\新建文件夹\b.xls`
	outFilePath := `G:\新建文件夹\b.repair.xls`
	replaceWord := []string{ "_xlnm.Print_Titles", "_xlnm.Print_Area" }
	f, err := os.Open(filePath)
	if err != nil {
		panic(err)
	}

	fSrc, err := ioutil.ReadAll(f)
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
