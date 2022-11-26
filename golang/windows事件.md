windows 事件之键盘监听

参考 [github](https://gist.github.com/obonyojimmy/52d836a1b31e2fc914d19a81bd2e0a1b)   [windows](https://docs.microsoft.com/en-us/windows/win32/inputdev/virtual-key-codes)

使用参考

```go
func main() {
    window.Start(func(key *window.KBDLLHOOKSTRUCT, down bool) {
		tmpKey := window.KBDLLHOOKSTRUCT2Name(*key)
		if down {
            fmt.Print("press down\t")
		} else {
			fmt.Print("press up\t")
		}
		fmt.Println(tmpKey)
    }
    for {}
}
```

```go
package window

import (
	"golang.org/x/sys/windows"
	"strconv"
	"syscall"
	"unsafe"
)

// String returns a human-friendly display name of the hotkey
// such as "Hotkey[Id: 1, Alt+Ctrl+O]"
var (
	user32 = windows.NewLazySystemDLL("user32.dll")
	procSetWindowsHookEx = user32.NewProc("SetWindowsHookExA")
	procLowLevelKeyboard = user32.NewProc("LowLevelKeyboardProc")
	procCallNextHookEx = user32.NewProc("CallNextHookEx")
	procUnhookWindowsHookEx = user32.NewProc("UnhookWindowsHookEx")
	procGetMessage = user32.NewProc("GetMessageW")
	procTranslateMessage = user32.NewProc("TranslateMessage")
	procDispatchMessage = user32.NewProc("DispatchMessageW")
	keyboardHook HHOOK
)


const (
	WH_KEYBOARD_LL = 13
	WH_KEYBOARD = 2
	WM_KEYDOWN = 256
	WM_SYSKEYDOWN = 260
	WM_KEYUP = 257
	WM_SYSKEYUP = 261
	WM_KEYFIRST = 256
	WM_KEYLAST = 264
	PM_NOREMOVE = 0x000
	PM_REMOVE = 0x001
	PM_NOYIELD = 0x002
	WM_LBUTTONDOWN = 513
	WM_RBUTTONDOWN = 516
	NULL = 0
)

type (
	DWORD uint32
	WPARAM uintptr
	LPARAM uintptr
	LRESULT uintptr
	HANDLE uintptr
	HINSTANCE HANDLE
	HHOOK HANDLE
	HWND HANDLE
)

type HOOKPROC func(int, WPARAM, LPARAM) LRESULT

type KBDLLHOOKSTRUCT struct {
	VkCode DWORD
	ScanCode DWORD
	Flags DWORD
	Time DWORD
	DwExtraInfo uintptr
}

// http://msdn.microsoft.com/en-us/library/windows/desktop/dd162805.aspx
type POINT struct {
	X, Y int32
}

// http://msdn.microsoft.com/en-us/library/windows/desktop/ms644958.aspx
type MSG struct {
	Hwnd HWND
	Message uint32
	WParam uintptr
	LParam uintptr
	Time uint32
	Pt POINT
}

func SetWindowsHookEx(idHook int, lpfn HOOKPROC, hMod HINSTANCE, dwThreadId DWORD) HHOOK {
	ret, _, _ := procSetWindowsHookEx.Call(
		uintptr(idHook),
		uintptr(syscall.NewCallback(lpfn)),
		uintptr(hMod),
		uintptr(dwThreadId),
	)
	return HHOOK(ret)
}

func CallNextHookEx(hhk HHOOK, nCode int, wParam WPARAM, lParam LPARAM) LRESULT {
	ret, _, _ := procCallNextHookEx.Call(
		uintptr(hhk),
		uintptr(nCode),
		uintptr(wParam),
		uintptr(lParam),
	)
	return LRESULT(ret)
}

func UnhookWindowsHookEx(hhk HHOOK) bool {
	ret, _, _ := procUnhookWindowsHookEx.Call(
		uintptr(hhk),
	)
	return ret != 0
}

func GetMessage(msg *MSG, hwnd HWND, msgFilterMin uint32, msgFilterMax uint32) int {
	ret, _, _ := procGetMessage.Call(
		uintptr(unsafe.Pointer(msg)),
		uintptr(hwnd),
		uintptr(msgFilterMin),
		uintptr(msgFilterMax))
	return int(ret)
}

func TranslateMessage(msg *MSG) bool {
	ret, _, _ := procTranslateMessage.Call(
		uintptr(unsafe.Pointer(msg)))
	return ret != 0
}

func DispatchMessage(msg *MSG) uintptr {
	ret, _, _ := procDispatchMessage.Call(
		uintptr(unsafe.Pointer(msg)))
	return ret
}

func LowLevelKeyboardProc (nCode int, wParam WPARAM, lParam LPARAM) LRESULT {
	ret, _, _ := procLowLevelKeyboard.Call(
		uintptr(nCode),
		uintptr(wParam),
		uintptr(lParam),
	)
	return LRESULT(ret)
}

var alpbeta = "abcdefghijklmnopqrstuvwxyz"
func KBDLLHOOKSTRUCT2Name(key KBDLLHOOKSTRUCT) string {
	if key.VkCode >= 96 && key.VkCode <= 105 {
		return strconv.Itoa(int(key.VkCode - 96))
	}
	if key.VkCode >= 48 && key.VkCode <= 57 {
		return strconv.Itoa(int(key.VkCode - 48))
	}
	if key.VkCode >= 65 && key.VkCode <= 90 {
		return alpbeta[key.VkCode - 65:key.VkCode - 64]
	}
	if key.VkCode == 13 {
		return "enter"
	}
	if key.VkCode == 27 {
		return "esc"
	}
	if key.VkCode == 110 || key.VkCode == 190 {
		return "."
	}
	return ""
}

// 模板
func Start(f func(key * KBDLLHOOKSTRUCT,down bool)) {
	// defer user32.Release()
	keyboardHook = SetWindowsHookEx(WH_KEYBOARD_LL,
		(HOOKPROC)(func(nCode int, wparam WPARAM, lparam LPARAM) LRESULT {
			if nCode == 0 && wparam == WM_KEYDOWN {
				//fmt.Println("key pressed:")
				kbdstruct := (*KBDLLHOOKSTRUCT)(unsafe.Pointer(lparam))
				//code := byte(kbdstruct.VkCode)
				//fmt.Printf("%q", code)
				f(kbdstruct,true)
			} else if nCode == 0 && wparam == WM_KEYUP {
				kbdstruct := (*KBDLLHOOKSTRUCT)(unsafe.Pointer(lparam))
				f(kbdstruct,false)
			}
			return CallNextHookEx(keyboardHook, nCode, wparam, lparam)
		}), 0, 0)
	var msg MSG
	for GetMessage(&msg, 0, 0, 0) != 0 {

	}
	UnhookWindowsHookEx(keyboardHook)
	keyboardHook = 0
}

```