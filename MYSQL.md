# installation troubleshooting & instructions 

## System Agnostic 

- bundler skipping over **mysql2** gem?

```Bash 

$ rm .bundle/config

$ bundle exec bundle install

```



## MacOS

**Homebrew setup:** 

(Note: alternative to Homebrew is [mySQL community server](https://dev.mysql.com/downloads/mysql/5.7.html#downloads) - available for all systems)

Dependencies: 

- `cmake`

- `openssl`

```Bash

$ brew install cmake

$ brew install openssl

```

Installation:

```Bash

#make sure you don't have any other versions of mysql installed
$ brew list

#if you do
$ brew uninstall <mysql@x.x>
$ brew unlink <mysql@x.x>

#install 5.7
$ brew install mysql@5.7

$ brew link mysql@5.7 --force
```

Test Usage:

```Bash

# install brew services 
$ brew tap homebrew/services

# cmd to run always - suggest aliasing this in your bash profile
$ brew services start mysql@5.7

#confirm its running
$ brew services list

# cmd to stop running
$ brew services stop mysql@5.7

```

Update Permissions

```Bash
# check for right permissions to the PIDs
$ ls -laF /usr/local/var/mysql/

# if the owner is root you should change it to mysql or username
$ sudo chown -R <username> /usr/local/var/mysql/

# confirm updated permissions
$ ls -laF /usr/local/var/mysql/

```

Account Setup

```Bash
# secure your account
$  mysql_secure_installation   

# set password
$ mysqladmin -u root password <newpassword>  
# login -- not root anymore
$ mysql -u <username> -p <password>       

```

Permission issues above?

(note these commands also fix the error: Can't connect to local MySQL server through socket '/tmp/mysql.sock' (2))

```Bash

$ mysql.server stop

#unset the temporary directory
$ echo $TMPDIR
$ unset TMPDIR
$ echo $TMPDIR

$ whoami

$ mysqld -initialize --verbose --user=$(whoami) --basedir="$(brew --prefix mysql)" --datadir=/usr/local/var/mysql --tmpdir=/tmp

#restart mysql
$ mysql.server restart


$ mysql -u root

#You should now be in the mysql command line shell
mysql> SELECT User, Host, authentication_string FROM mysql.user;

mysql> rename user 'root'@'localhost' to '<yourUsername>'@'localhost';

#confirm
mysql> SELECT User, Host, authentication_string FROM mysql.user; 

mysql> flush privileges;

mysql> exit

```

Reconfirm Access

(whenever want to access the mysql db locally, need to run this login first - suggest aliasing in bash profile)

```Bash

$ mysql -u <username> -p

```



## Pending: please add instructions for your respective system 

