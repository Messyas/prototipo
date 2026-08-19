import pyautogui
import time

def clicks(a, b):
    pyautogui.sleep(DEFAULT_TIME)
    pyautogui.click(a, b)

def download(x, y):
    pyautogui.sleep(DEFAULT_TIME)
    pyautogui.click(x, y)
    pyautogui.sleep(DEFAULT_TIME)
    pyautogui.click(744, 568)
    pyautogui.sleep(DEFAULT_TIME)
    pyautogui.click(pyautogui.locateCenterOnScreen('imagem_1.png', confidence=0.8))
    
    
DEFAULT_TIME = 4
pyautogui.sleep(DEFAULT_TIME)
clicks(94, 54) 
clicks(160, 340)
clicks(674, 602)
pyautogui.write('1')
clicks(763, 659)
download(93, 260)
download(130, 287)