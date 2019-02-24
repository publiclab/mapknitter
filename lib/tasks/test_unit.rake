namespace :test do

  # no seperation for tests by file but separation between unit and functional
  Rake::TestTask.new do |t|
    t.name = "all"
    t.description = "all"
    t.libs << "test"
    t.pattern = FileList["test/unit/*_test.rb", "test/functional/*_test.rb"]
    t.warning = false
    t.verbose = true
  end

  # autogenerates a rake task for every test file added to test/unit
  COMPUTE_UNIT_TASKS = []
    Dir.glob("test/unit/*_test.rb").each do |task|
    collection = task.gsub(/test\/unit\//, "")
    Rake::TestTask.new(:"#{collection}") do |t|
      t.libs << "test"
      t.description = "Autotask - run unit tests - #{collection}"
      t.pattern = FileList["test/unit/#{collection}"]
      t.warning = false
      t.verbose = true
    end
    COMPUTE_UNIT_TASKS << "#{collection}"
  end

  # runs unit tests, one file at a time, in file order
  desc "Run unit tests"
  task :unit => COMPUTE_UNIT_TASKS

  # runs unit tests, one file at a time, concurrently (order is similar but not guaranteed)
  desc "Run unit tests in parallel"
  multitask :unit_parallel => COMPUTE_UNIT_TASKS

  # autogenerates a rake task for every test file added to test/functional
  COMPUTE_FUNCTIONAL_TASKS = []
  Dir.glob("test/functional/*_test.rb").each do |task|
    collection = task.gsub(/test\/functional\//, "")
    Rake::TestTask.new(:"#{collection}") do |t|
      t.libs << "test"
      t.description = "Autotask - run functional tests - #{collection}"
      t.pattern = FileList["test/functional/#{collection}"]
      t.warning = false
      t.verbose = true
    end
    COMPUTE_FUNCTIONAL_TASKS << "#{collection}"
  end

  # runs functional tests, one file at a time, in file order
  desc "Run functional tests"
  task :functional => COMPUTE_FUNCTIONAL_TASKS

  # runs functional tests, one file at a time, concurrently (order is similar but not guaranteed)
  desc "Run functional tests in parallel"
  multitask :functional_parallel => COMPUTE_FUNCTIONAL_TASKS

end