#Requires AutoHotkey v2.0
#SingleInstance Force

; Avid Keyboard Locale Fix v1.0
; Automatically dismisses Avid Media Composer's Keyboard Input Locale warning.
; Requires AutoHotkey v2.
;
; Detection uses process + Qt window class + title + DPI-aware dialog dimensions.
; The reference dialog is 502x132 logical pixels and Windows may report physical
; pixels depending on DPI/scaling.

SetTimer(CheckAvidKeyboardWarning, 10)

candidateHwnd := 0
candidateCount := 0

CheckAvidKeyboardWarning()
{
    global candidateHwnd, candidateCount

    hwnd := WinExist("A")
    if !hwnd {
        ResetCandidate()
        return
    }

    try {
        title := WinGetTitle("ahk_id " hwnd)
        class := WinGetClass("ahk_id " hwnd)
        exe   := WinGetProcessName("ahk_id " hwnd)
        WinGetPos(&x, &y, &w, &h, "ahk_id " hwnd)

        if (exe != "AvidMediaComposer.exe"
            || class != "Qt656QWindowIcon"
            || title != "AvidMediaComposer") {
            ResetCandidate()
            return
        }

        ; Reference size observed at 100% scaling: ~502 x 132.
        ; Accept common Windows scaling factors with a small tolerance.
        scales := [1.00, 1.25, 1.50, 1.75, 2.00]
        sizeMatch := false

        for scale in scales {
            targetW := Round(502 * scale)
            targetH := Round(132 * scale)

            if (Abs(w - targetW) <= 8 && Abs(h - targetH) <= 8) {
                sizeMatch := true
                break
            }
        }

        if !sizeMatch {
            ResetCandidate()
            return
        }

        ; Require two consecutive detections of the exact same window.
        if (candidateHwnd = hwnd)
            candidateCount++
        else {
            candidateHwnd := hwnd
            candidateCount := 1
        }

        if (candidateCount >= 2) {
            Send "{Enter}"
            ResetCandidate()
        }
    }
    catch {
        ResetCandidate()
    }
}

ResetCandidate()
{
    global candidateHwnd, candidateCount
    candidateHwnd := 0
    candidateCount := 0
}
