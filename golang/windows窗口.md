- windows 窗口相关的 api 函数定义

```go
package window

import (
	"syscall"
	"unsafe"
)

var (
	user32dll          = syscall.MustLoadDLL("user32.dll")
	procEnumWindows    = user32dll.MustFindProc("EnumWindows")
	procGetWindowTextW = user32dll.MustFindProc("GetWindowTextW")
	procGetWindowRect = user32dll.MustFindProc("GetWindowRect")
)

// Window represents any Window that is opened in the Windows OS
type Window struct {
	handle syscall.Handle
	title  string
}

// Title returns the title of the window
func (w Window) Title() string {
	return w.title
}

// GetAllWindows finds all currently opened windows
func GetAllWindows() map[syscall.Handle]Window {
	m := make(map[syscall.Handle]Window)
	cb := syscall.NewCallback(func(h syscall.Handle, p uintptr) uintptr {
		bytes := make([]uint16, 200)
		_, err := GetWindowText(h, &bytes[0], int32(len(bytes)))
		title := "||| no title found |||"
		if err == nil {
			title = syscall.UTF16ToString(bytes)
		}
		m[h] = Window{h, title}
		return 1 // continue enumeration
	})
	EnumWindows(cb, 0)
	return m
}

// EnumWindows loops through all windows and calls a callback function on each
func EnumWindows(enumFunc uintptr, lparam uintptr) (err error) {
	r1, _, e1 := syscall.Syscall(procEnumWindows.Addr(), 2, uintptr(enumFunc), uintptr(lparam), 0)
	if r1 == 0 {
		if e1 != 0 {
			err = error(e1)
		} else {
			err = syscall.EINVAL
		}
	}
	return
}

// GetWindowText gets the title of a Window given by a certain handle
func GetWindowText(hwnd syscall.Handle, str *uint16, maxCount int32) (len int32, err error) {
	r0, _, e1 := syscall.Syscall(procGetWindowTextW.Addr(), 3, uintptr(hwnd), uintptr(unsafe.Pointer(str)), uintptr(maxCount))
	len = int32(r0)
	if len == 0 {
		if e1 != 0 {
			err = error(e1)
		} else {
			err = syscall.EINVAL
		}
	}
	return
}

type RECT struct {
	Left   int32 // or Left, Top, etc. if this type is to be exported
	Top    int32
	Right  int32
	Bottom int32
}
func GetWindowRect(hwnd syscall.Handle) RECT {
	rect := RECT{}
	syscall.Syscall(procGetWindowRect.Addr(), 3, uintptr(hwnd), uintptr(unsafe.Pointer(&rect)), 0)
	return rect
}
```

- 大致用法

```go
// 查找窗口及位置(rect 为左上角和右下角位置)
func testWindow()  {
	const title = "原神"
	m := window.GetAllWindows()
	fmt.Println("查找原神窗口")
	for handle := range m {
		if title == m[handle].Title() {
			rect := window.GetWindowRect(handle)
			fmt.Printf("找到窗口：'%v'\n", m[handle])
			fmt.Print("窗口大小及位置：\t")
			fmt.Println(rect)
			// checkTargetHeightAndWidth(rect)
			break
		}
		if !fish {
			break
		}
	}
}
```