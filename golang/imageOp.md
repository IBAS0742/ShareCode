## imageOp

```go
package imageOP

import (
	"fmt"
	"image"
	"image/png"
	"io"
	"os"
)

func GetPiexls(filePath string) (pixels [][]Pixel,err error) {

	image.RegisterFormat("png", "png", png.Decode, png.DecodeConfig)
	var file *os.File
	file, err = os.Open(filePath)
	if err != nil {
		fmt.Println("Error: File could not be opened")
		os.Exit(1)
	}
	defer file.Close()
	pixels, err = getPixels(file)
	if err != nil {
		fmt.Println("Error: Image could not be decoded")
		//os.Exit(1)
	}
	return
}

// Get the bi-dimensional pixel array
func getPixels(file io.Reader) ([][]Pixel, error) {
	img, _, err := image.Decode(file)

	if err != nil {
		return nil, err
	}

	bounds := img.Bounds()
	width, height := bounds.Max.X, bounds.Max.Y

	var pixels [][]Pixel
	for y := 0; y < height; y++ {
		var row []Pixel
		for x := 0; x < width; x++ {
			row = append(row, RgbaToPixel(img.At(x, y).RGBA()))
		}
		pixels = append(pixels, row)
	}

	return pixels, nil
}

// img.At(x, y).RGBA() returns four uint32 values; we want a Pixel
func RgbaToPixel(r uint32, g uint32, b uint32, a uint32) Pixel {
	return Pixel{int(r / 257), int(g / 257), int(b / 257), int(a / 257)}
}

// Pixel struct example
type Pixel struct {
	R int
	G int
	B int
	A int
}
```