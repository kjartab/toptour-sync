Vagrant.configure(2) do |config|

    config.vm.box = "ubuntu/trusty64" 
    config.ssh.insert_key = true

    config.vm.provider "virtualbox" do |v|
      v.memory = 8000
      v.cpus = 4
    end

    config.vm.network :forwarded_port, host: 8011, guest: 80 # Apache
    config.vm.network :forwarded_port, host: 3011, guest: 9200 # ElasticSearch
    config.vm.network :forwarded_port, host: 5411, guest: 5432 # ElasticSearch
    config.vm.network :forwarded_port, host: 8111, guest: 8080 # ElasticSearch

    config.vm.provision "ansible_local" do |ansible|
        ansible.playbook = "provision/rolesplaybook.yaml"
    end
    
    config.vm.provision "ansible_local" do |ansible|
        ansible.playbook = "provision/playbook.yaml"
    end

end