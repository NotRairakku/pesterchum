package config

import "os"

type Config struct {
	DBHost   string
	DBPort   string
	DBName   string
	DBUser   string
	DBPass   string
	GRPCPort string
}

func Load() Config {
	return Config{
		DBHost:   os.Getenv("DB_HOST"),
		DBPort:   os.Getenv("DB_PORT"),
		DBName:   os.Getenv("DB_NAME"),
		DBUser:   os.Getenv("DB_USER"),
		DBPass:   os.Getenv("DB_PASSWORD"),
		GRPCPort: os.Getenv("GRPC_PORT"),
	}
}
