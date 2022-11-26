## shp 文件读写

- 这里用到的 shp 库是 https://github.com/jonas-p/go-shp ，但是因为无法正常加载，这里附加另一个版本，见 shpOp.zip

```golang
// 创建属性表
fields := []Utils.Field{
    Utils.NumberField("field_1",32),
    Utils.NumberField("field_2",32),
}

// 创建 shp 文件写出对象
var shpWriter * Utils.Writer
shpWriter,err = Utils.Create("D:\\tmp\\test\\tiqu\\out.shp",Utils.POINT)
defer shpWriter.Close()

if err != nil {
    panic(err)
}
// 设置属性表
shpWriter.SetFields(fields)

for i := 0;i < 10;i++ {
    // 创建要素对象
    point := Utils.Point{
        rand.Int(),rand.Int(),
    }
    shpWriter.Write(&point)
    // 为第 i 个要素设置 field_1 的属性的值
    shpWriter.WriteAttribute(i,0,12)
    // 为第 i 个要素设置 field_2 的属性的值
    shpWriter.WriteAttribute(i,1,34)
}
```