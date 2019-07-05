<<<<<<< Updated upstream
# MySQL Installation
=======
# installation troubleshooting & instructions 

## System Agnostic 

- bundler skipping over **mysql2** gem?

```Bash 

$ ç

$ bundle exec bundle install

```

>>>>>>> Stashed changes

## Instructions

## MacOS

### Homebrew setup:

(Note: The alternative to Homebrew is [mySQL community server](https://dev.mysql.com/downloads/mysql/5.7.html#downloads) - available for all systems)

**Dependencies:**

- `$ brew install cmake`


- `$ brew install openssl`


**Installation:**

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

**Test Usage:**

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

**Update Permissions:**

```Bash
# check for right permissions to the PIDs
$ ls -laF /usr/local/var/mysql/

# if the owner is root you should change it to mysql or username
$ sudo chown -R <username> /usr/local/var/mysql/

# confirm updated permissions
$ ls -laF /usr/local/var/mysql/

```

**Account Setup:**

```Bash
# secure your account
$  mysql_secure_installation   

# set password
$ mysqladmin -u root password <newpassword>  
# login -- not root anymore
$ mysql -u <username> -p <password>       

```

**Permission issues above?**

(Note: These commands also fix the error - `Can't connect to local MySQL server through socket '/tmp/mysql.sock' (2)`)

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

**Reconfirm Access**

Whenever you want to access the mysql db locally, you need to run this login first. It might be useful to alias this in your bash profile.

```Bash
$ mysql -u <username> -p
```


## Linux

**Installation:**

```Bash

# If you do not have mysql-server installed run
$ sudo apt-get install mysql-server
# Enter a password you can rem when prompted during installation for root

```
**Configure MapKnitter account:**

```Bash
$ mysql -u root -p
# Enter the password you input during installation
# Create a mapknitter user
$ CREATE USER 'mapknitter' IDENTIFIED BY 'password';
# Grant permissions to the new user
$ GRANT ALL ON *.* TO 'mapknitter' WITH GRANT OPTION;

```

_If you get the error `Access denied for user 'root'@'localhost'" error"`_ 

Meaning maybe you forgot your root password or was not prompted when installing. You might be having some dependencies of mysql in your machine. You need to remove all the dependencies and reinstall mysql a fresh. 
Use the following commands to remove mysql and all its dependencies

```Bash
$ sudo -i
$ service mysql stop
$ killall -KILL mysql mysqld_safe mysqld
$ apt-get --yes purge mysql-server mysql-client
$ apt-get --yes autoremove --purge
$ apt-get autoclean
$ deluser --remove-home mysql
$ delgroup mysql
$ rm -rf /etc/apparmor.d/abstractions/mysql /etc/apparmor.d/cache/usr.sbin.mysqld /etc/mysql /var/lib/mysql /var/log/mysql* /var/log/upstart/mysql.log* /var/run/mysqld
$ updatedb
$ exit

````
After this repeat installation and configuration steps


Add the username and passsword on the `config/database.yml` development:

Note: _You can use MariaDB in development as your database if you are more comfortable with it_

## Troubleshooting

### MySQL build / setup

1. Ensure you have the lateset version of `xcode` installed (MacOS only)

2. Check your MySQL verion to make sure it matches the one specified in the instructions: `$ mysql --version`

3) Reference section on this page "permission issues above?" for handling this error:

    <blockquote>
    Cannot connect to local MySQL server through socket '/tmp/mysql.sock' (2)
    </blockquote>

### mysql2 gem

1. Ensure you have a `database.yml` set up for `adapter: mysql2`

    -   Copy the contents of [`database.yml.example`](config/database.yml.example), but add your personal username and password, which should have been set up during MySQL setup.


2. If you ever see this error, **do not update to this gem**. Look online or ask PL for help!
    <blockquote>
    Please install the mysql2 adapter: gem install activerecord-mysql2-adapter (cannot load such file -- mysql2/mysql2) (LoadError)
    </blockquote>

3. Bundler skipping over **mysql2** gem?

    ``` Bash
    $ rm .bundle/config

    $ bundle exec bundle install
    ```
