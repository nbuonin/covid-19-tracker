SENTINAL = ./node_modules/sentinal

$(SENTINAL): package.json
	-rm -rf node_modules
	npm install
	touch $(SENTINAL)

build: $(SENTINAL)
	npm run build

runserver: $(SENTINAL)
	npm start

test: $(SENTINAL)
	npm test

deploy: $(SENTINAL)
	npm run deploy 

.PHONY: build runserver test deploy
