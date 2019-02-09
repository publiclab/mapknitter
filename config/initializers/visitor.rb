# this is a customization created to bridge incompatabilities when upgrading Ruby 2.1.2
# to 2.4.4 with Rails 3.2. 

#explanation 
# Ruby 2.4 unifies Fixnum and Bignum into Integer: https://bugs.ruby-lang.org/issues/12005
# Ruby ~2.3 `1234.class` is `Fixnum` and `123456789012345678901234567890.class` is `Bignum`.
# Ruby 2.4+ `1234.class` is `Integer` and `123456789012345678901234567890.class` is `Integer`.

# So for compatability with 2.4 arel defined a visit_Integer method

# Arel is now bundled in the Active Record gem, and maintained in the rails/rails repository. 
# This code can be deleted on update to `activerecord >= 6.0` (Rails 6)

module Arel
  module Visitors
    class DepthFirst < Arel::Visitors::Visitor
      alias :visit_Integer :terminal
    end

    class Dot < Arel::Visitors::Visitor
      alias :visit_Integer :visit_String
    end

    class ToSql < Arel::Visitors::Visitor
      alias :visit_Integer :literal
    end
  end
end