package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	hash, _ := bcrypt.GenerateFromPassword([]byte("Veritrans&9527*#"), bcrypt.DefaultCost)
	fmt.Println(string(hash))
}