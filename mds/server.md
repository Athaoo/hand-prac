#### 一、环境

1. node
   
   npm install -g 权限不足
   `mkdir ~/.npm-global`
   
   `npm config set prefix '~/.npm-global'`
   
   `export PATH=~/.npm-global/bin:$PATH`
   
   `source .bashrc`

2. 安装yarn
   
   要先把linux内置的cmdtest删掉，然后把yarn的package换了
   
   ```
   sudo apt remove cmdtest
   sudo apt remove yarn
   curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
   echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
   sudo apt-get update
   sudo apt-get install yarn -y
   ```

#### 二、mysql

为了在 MySQL 数据库中创建用户和数据库，你可以使用 MySQL 的命令行客户端（通常是 `mysql` 命令）。根据你提供的配置文件内容，以下是创建用户和数据库的指令：

1. 创建数据库用户：

`CREATE USER 'athaoo'@'localhost' IDENTIFIED BY 'athaooblog123';`

这条指令将在 MySQL 数据库中创建一个名为 `athaoo` 的用户，密码为 `athaooblog123`。请注意，这里的 `localhost` 表示该用户只能从本地连接访问数据库，如果需要远程访问，可以将 `localhost` 改为允许的远程主机IP或者 `%`。

2. 创建数据库：

`CREATE DATABASE athaoo_blog;`

这条指令将在 MySQL 数据库中创建一个名为 `athaoo_blog` 的数据库。

3. 授予用户权限：

`GRANT ALL PRIVILEGES ON athaoo_blog.* TO 'athaoo'@'localhost';`

这条指令将授予用户 `athaoo` 在数据库 `athaoo_blog` 上的所有权限。

以上指令可以通过在 MySQL 命令行客户端中执行，也可以将其保存在一个 `.sql` 文件中，然后通过以下命令执行：

`mysql -u root -p < filename.sql`

其中，`root` 是数据库管理员用户名，执行命令后会提示输入密码，输入管理员密码即可执行 SQL 文件中的指令。

请确保在执行数据库操作前备份重要数据，以免不小心造成数据丢失或损坏。如果你是在生产环境中进行操作，请格外小心谨慎。

### 三 nginx

历时一整天，踩坑无数，终于解决了

直接查看conf吧

```
root@VM-16-6-debian:/etc/nginx# cat nginx.conf 
#user www-data
user root;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
        worker_connections 768;
        # multi_accept on;
}

http {
         server {
                listen 80;
                server_name 154.8.162.201;

                location /admin {
#                       alias /usr/local/mylib/athaoo-blog/fe/dist/admin;
#                       index index.html index.htm;
#                       try_files $uri $uri/ /index.html;
                        proxy_pass http://localhost:8081/;
                }
                location /api/ {
                        proxy_pass http://localhost:3000/api/;
                }
                location / {
                        root /usr/local/mylib/athaoo-blog/fe/dist/blog;
                        index index.html index.htm;
                        try_files $uri $uri/ /index.html;
                }
                add_header Access-Control-Allow-Origin *;
                add_header Access-Control-Allow-Headers Authorization,Content-Type,Accept,Origin,User-Agent,DNT,Cache-Control,X-Mx-ReqToken,X-Data-Type,X-Requested-With,token,platform;
                add_header Access-Control-Allow-Methods 'GET,POST,OPTIONS,HEAD,PUT';
                add_header Access-Control-Allow-Credentials true;

                if ( $request_method = 'OPTIONS' ) { 
                     return 200;
                }
        }
        server {
                listen 8081;
                server_name localhost;

                location / {
                        add_header Access-Control-Allow-Origin *;
                        root /usr/local/mylib/athaoo-blog/fe/dist/admin;
                        index index.html index.htm;
                        try_files $uri $uri/ /inde


x.html;
                }
        }
#......
}
```

坑点汇总

1. 除了nginx.conf，nginx还自带一个default的配置，里面会优先把我的自定义location给失效掉，我的location / 没有走我自己的root，非常坑，而且网上没什么这方面资料，都在告诉你怎么写root，最后把default里面的东西都注释掉就好了

2. www-data权限不足
   
   查看error.log发现13permission denied，查资料后把conf最上面的user换成root就好了

3. 跨域
   
   需要把koa的cors中间件关掉，不然会加两遍跨域响应头，请求报错。
   
   在nginx里面开启跨域就可以了(添加cors头)

4. 静态资源处理
   
   需要新建一个静态资源目录，并赋予读取权限，然后由nginx转发

5. 

### 四、服务启动

1. 先把yarn的bin设置到全局变量
   
   `root@VM-16-6-debian:/usr/local/mylib/athaoo-blog/be# yarn global bin
   /root/bin`
   
   `export PATH="$PATH:/root/bin"`
   
   `source ~/.bashrc`

2. 安装pm2
   
   `yarn global add pm2`
   
   `pm2 -v`
   
   在be的package.json中添加服务端启动服务的指令`pm2 start app.js --name blog-be`

3. 配置nginx 的api转发

### 五、Over
