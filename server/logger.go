package main

import (
	"fmt"
	"log"
	"os"
	"time"
)

type Logger struct {
	filename string
	file     *os.File
}

func (l *Logger) Init() {
	now := time.Now().Format("2006-01-02-15-04-05")
	l.filename = now

	fileInfo, err := os.Lstat("./")
	if err != nil {
		fmt.Println(err)
	}

	_, err = os.Stat("log/")
	if os.IsNotExist(err) {
		fileMode := fileInfo.Mode()
		unixPerms := fileMode & os.ModePerm
		if err := os.Mkdir("log/", unixPerms); err != nil {
			log.Fatal(err)
		}
	}

	l.file, err = os.OpenFile(fmt.Sprintf("log/%s.log", l.filename), os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal(err)
	}
}

func (l *Logger) Finally() {
	l.Info("Close log file")
	l.file.Close()
}

func (l *Logger) Empty() {
	l.Log("INFO", "")
}

func (l *Logger) Info(text string) {
	l.Log("INFO", text)
}

func (l *Logger) Warn(text string) {
	l.Log("WARN", text)
}

func (l *Logger) Error(text string) {
	l.Log("ERROR", text)
}

func (l *Logger) ErrorE(err error) {
	l.Log("ERROR", err.Error())
}

func (l *Logger) Log(tag string, text string) {
	str := fmt.Sprintf("[%s] [%s] %s", time.Now().Format("2006-01-02 15:04:05"), tag, text)
	fmt.Println(str)
	fmt.Fprintln(l.file, str)
}
