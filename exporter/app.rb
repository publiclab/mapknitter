# Copyright 2015 Google, Inc
# Copyright 2019 Public Lab
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

require "sinatra"
require "json"

get "/" do
  markdown :landing
end


post '/export' do
  unless params[:metadata] &&
       (tmpfile = params[:metadata][:tempfile]) &&
       (name = params[:metadata][:filename])
    @error = "No file selected"
    return markdown :landing
  end
  STDERR.puts "Uploading file, original name #{name.inspect}"
  @data = JSON.parse(tmpfile.read)
  String @data[0]['image_file_name']
end
