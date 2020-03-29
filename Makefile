SENTINAL = package.json

$(SENTINAL):
	-rm -rf node_modules
	npm install
	touch $(SENTINAL)

build: $(SENTINAL)
	npm run build

runserver: $(SENTINAL)
	npm start

test: $(SENTINAL)
	npm test

.PHONY: build runserver test
