# this is a customization created to bridge incompatabilities when upgrading Ruby 2.1.2
# to 2.4.4 with Rails 3.2. 

# explanation
# There's a fundamental asymmetry in how operators work in Ruby - 
# `1 * 1.second` dispatches -> * on Integer. 
# `1.second * 1` dispatches -> * on Duration -> throws error 'Duration can't be coerced into Integer'

# the source code for Rails 3.2 puts duration second: https://github.com/rails/rails/blob/v3.2.22.5/activesupport/lib/active_support/core_ext/numeric/time.rb

# the solution: the order of multiplication has to be swtiched, and Duration put first. 

# this code can be removed with ActiveSupport v.5.0.3: https://github.com/rails/rails/blob/v5.0.3/activesupport/lib/active_support/core_ext/numeric/time.rb
# (Rails 5)

class Numeric
  def days
    ActiveSupport::Duration.new(24.hours * self, [[:days, self]])
  end
  alias :day :days

  def weeks
    ActiveSupport::Duration.new(7.days * self, [[:days, self * 7]])
  end
  alias :week :weeks

  def fortnights
    ActiveSupport::Duration.new(2.weeks * self, [[:days, self * 14]])
  end
  alias :fortnight :fortnights
end

# source code: https://github.com/rails/rails/blob/v3.2.22.5/activesupport/lib/active_support/core_ext/integer/time.rb

# fixed as of ActiveSupport v.4.1.2 https://github.com/rails/rails/blob/v4.1.12/activesupport/lib/active_support/core_ext/integer/time.rb
# (Rails 4)

class Integer
  def months
    ActiveSupport::Duration.new(30.days * self, [[:months, self]])
  end
  alias :month :months

  def years
    ActiveSupport::Duration.new(365.25.days * self, [[:years, self]])
  end
  alias :year :years
end