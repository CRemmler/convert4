import csv

ifile  = open('server-input.txt', "rb")
reader = csv.DictReader(ifile)
ofile  = open('server-output.csv', "wb")
writer = csv.writer(ofile)

for row in reader:
    ofile.write('\n')
    ofile.write('fs.readFileAsync("')
    filename = row["filename"]
    ofile.write(filename)
    ofile.write('"')
    pos = filename.rfind('.')
    extension = filename[ pos + 1 : len(filename)]
    utf8extensionlist = ["js", "css", "html", "json", "md"]
    if any(extension in s for s in utf8extensionlist):
        ofile.write(', "utf8"')
    
    ofile.write(').then(function(data) {')
    ofile.write('\n\tzip.file("')
    ofile.write(filename[5:len(filename)])
    ofile.write('", data);')  
    ofile.write('\n}).then(function() {')

    
ofile.write('\n\n')
ifile.close()
ifile = open('server-input.txt',"rb")
reader = csv.DictReader(ifile)

ofile.write('}); }); }); }); ')
for row in reader:
  ofile.write('}); ')

ifile.close()
ofile.close()


