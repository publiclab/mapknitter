read -p "Enter your cloud9 username: " un
./install.sh
rake cloud9 username=$un
echo "Done! Run the application with 'rails s -b \$IP -p \$PORT'"
