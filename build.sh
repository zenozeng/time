coffee --compile --output tmp/ src/
rm -r tmp
coffee --join js/main.js --watch --map --compile --bare src/*.coffee
