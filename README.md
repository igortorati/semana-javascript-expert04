# ClubHouse Clone - Semana JS Expert 4.0

<img src="https://i.imgur.com/VNuHa1l.png">

Este projeto se trata de um clone simples do ClubHouse com a funcionalidade de salas com chamadas de áudio. Ele foi desenvolvido durante a Semana JavaScript Expert #04 e não se trata de uma aplicação completa, sua finalidade é apenas de cunho educativo.

Esta aplicação foi feita utilizando NodeJS, WebSocket e PeerJS, com login feito por contas do GitHub através do Firebase e está hospedado no Heroku.

Existem três serviços hospedados para que esta aplicação funcione:

 - Servidor de Aplicação.
 - Servidor PeerJS.
 - Servidor WebSocket.

O servidor de aplicação pode ser acessado pelo link https://sjse-clubhouse.herokuapp.com/

(Esta aplicação foi testada em 3 desktops diferentes utilizando o Chrome (Versão 90.0.4430.212) e um dispositivo móvel com Chrome (Versão 89.0.4389.90))

## Features do sistema
  

- O app deve funcionar na Web, Android e IOS

- Login
	- Deve ter login com GitHub
	- Se houver dados do usuário em localStorage deve ir para lobby direto

  

- Lobby

	- Se não houver dados do usuário em localStorage deve voltar para login

	- Mostra todas as salas ativas

	- Atualiza salas em realtime

	- Pode criar uma sala sem tópico

	- Pode criar uma sala com tópico

	- Pode acessar salas ativas

- Room

	- Se não houver dados do usuário em localStorage deve voltar para login

	- Cria uma sala com um usuário dono

	- Todos usuários futuros entram com perfil de attendees

	-  Notifica Lobby sobre atualizações na sala

	- Lista usuários com perfis de speakers e attendees

	- Se o dono da sala desconectar, será removida

- Users

	- Speaker

		- Recebe notificação de attendees para se tornarem speakers

		- Atualizam a tela o upgrade de attendee para speaker

		- Poderá deixar seu microfone mudo

	- Se dono da sala

		- Pode aprovar attendees a virarem speakers

		- Ao se desconectar

			- Promove o speaker mais velho da sala

			- Se não houver speaker promove o attendee mais velho da sala

	- Attendee

		- Pode ouvir speakers ativos

		- Pode pedir upgrade de perfil ao dono da sala

		- Ao ser aprovado

			- Reinicia todas as suas chamas ativas com os usuários da sala

			- Recebe as permissões do perfil speaker
