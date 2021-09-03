FROM gitpod/workspace-mysql

# Install Ruby version 2.4.6 and set it as default
RUN echo "rvm_gems_path=/home/gitpod/.rvm" > ~/.rvmrc
RUN bash -lc "rvm install ruby-2.4.6 && rvm use ruby-ruby-2.4.6 --default"
RUN echo "rvm_gems_path=/workspace/.rvm" > ~/.rvmrc
