require 'application_system_test_case'

class SearchesTest < ApplicationSystemTestCase
    test 'visiting the index' do
      visit '/'

      fill_in('search-input', with: 'hola')
      find('button.btn-light').click
      assert_selector('h2', text: 'Search results for \'hola\'')
    end
end
