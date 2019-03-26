# Copyright 2015 Google, Inc
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

require_relative "../app.rb"
require "rspec"
require "rack/test"

describe "Hello World" do
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end

  it "displays hello world text" do
    get "/"
    expect(last_response.body).to eq("Hello world!")
  end
end
