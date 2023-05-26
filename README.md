# joao-microservices
# Avaliador de Código em Blocos - João

Este projeto é dedicado para o ensino a programação básica utilizando a abordagem de programação em blocos. Este software foi criado a partir da arquitetura de microsserviços.

## Técnologias empregadas
- RabbitMq
- NodeJS
- MongoDB
- Docker


![Arquitetura do Sistema](https://user-images.githubusercontent.com/60445477/221367746-25fda647-eae7-462f-ad27-735e0633e284.png)

# Segurança

Atualemente, é possível se autenticar atraves da rota `/login` o qual será autenticado usando chaves de criptografia assimétrica (RS256).
Portanto, é necessário gerar as chaves antes de iniciar o sistema, logo ao na pasta user-service rode o comando
```sh
    openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
```
e nas pastas problems-service e chat-service rode:
```sh
openssl rsa -pubout -in ../user-service/private_key.pem -out public_key.pem
``` 