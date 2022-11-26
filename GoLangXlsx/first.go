package main

import (
	"fmt"	// 打印
	"github.com/360EntSecGroup-Skylar/excelize"	// 表格操作
	"strconv"	// 数字转字符串
)

func main() {
	inFile := `D:\docx\myTest.xlsx`
	outFile := `D:\docx\myTest.rep.xlsx`
	sheetName := `Sheet1`
	f,e := excelize.OpenFile(inFile)
	if e != nil {
		panic(e)
	}
	rows := f.GetRows(sheetName)
	ind := 0
	for rind, row := range rows {
		for cind, colCell := range row {
			//print(colCell, "\t")
			//print("(")
			//print(rind + 1)
			//print(",")
			//print(excelize.ToAlphaString(cind))
			//println(") = ",colCell)
			loc := excelize.ToAlphaString(cind) + strconv.Itoa(rind + 1)
			// 2.x 版本
			// loc := excelize.ColumnNumberToName(cind) + strconv.Itoa(rind + 1)
			if colCell != "" {
				fmt.Println(loc)
				ind++
				f.SetCellValue(sheetName,loc,"xxxx" + strconv.Itoa(ind) + "xxxx")
			}
		}
		f.SaveAs(outFile)
	}
}

