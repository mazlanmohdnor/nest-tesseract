#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

$1::
send, class1_lightVehicle{enter}{enter}
return

$2::
send, class2_mediumVehicle{enter}{enter}
return

$3::
send, class3_heavyVehicle{enter}{enter}
return

$4::
send, class4_taxi{enter}{enter}
return

$5::
send, class5_bus{enter}{enter}
return

$z::
send, singleWheel{enter}{enter}
return

$x::
send, doubleWheel{enter}{enter}
return

$c::
send, license_plate{enter}{enter}
return

$s::
send, ^s{enter}{left}{enter}d


