FROM gitpod/workspace-mysql

# Install Ruby version 2.7.6 and set it as default
RUN echo "rvm_gems_path=/home/gitpod/.rvm" > ~/.rvmrc
RUN bash -lc "rvm install ruby-2.7.6 && rvm use ruby-ruby-2.7.6 --default"
RUN echo "rvm_gems_path=/workspace/.rvm" > ~/.rvmrc
