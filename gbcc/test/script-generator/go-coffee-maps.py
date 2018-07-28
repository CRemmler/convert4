import csv

def camel(x):
    final = ''
    upper = 0
    for item in x:
	if (upper == 1):
	    final += item.upper()
	    upper = 0
	else:
	    if item == "-":
	        upper = 1
	    else:
	        final += item
    return final

ifile  = open('maps-input.csv', "rb")
reader = csv.DictReader(ifile)
ofile  = open('maps-output-coffee.csv', "wb")
writer = csv.writer(ofile)

ofile.write("# (C) Uri Wilensky. https://github.com/NetLogo/Tortoise\n")
ofile.write("\n")
ofile.write("module.exports = {\n")
ofile.write("\n")
ofile.write("  dumper: undefined\n")
ofile.write("  init: (workspace) ->")
ofile.write("\n")

for row in reader:
	ofile.write("    # ")
	if (row["input-type"].strip() == ""):
		ofile.write("()")
	else:
		ofile.write(row["input-type"].strip().replace(";",","))
	ofile.write(" => ")
	if (row["output-type"] == ""):
		ofile.write("()")
	else:
		ofile.write(row["output-type"])
	ofile.write("\n")
	ofile.write("    "+camel(row["prim-name"].strip()))
	ofile.write(" = ")
	if (row["input-type"].strip() == ""):
		ofile.write("()")
	else:
		ofile.write(row["input-name"].strip().replace(";",","))
	ofile.write(" ->\n")
	ofile.write("        ")
	if (row["output-type"] != ""):
		ofile.write("return ")
	ofile.write("Maps.")
	ofile.write(camel(row["prim-name"].strip()))
	if (row["input-name"].strip() == ""):
		ofile.write("()")
	else:
		ofile.write(row["input-name"].strip().replace(";",","))
	ofile.write("\n\n")

ifile.close()
ifile = open('maps-input.csv',"rb")
reader = csv.DictReader(ifile)

ofile.write("    {\n")
ofile.write('      name: "maps"\n')
ofile.write("    , prims: {\n")

for row in reader:
	ofile.write('      "'+row["prim-name"].strip().upper()+'": ')
	ofile.write(camel(row["prim-name"].strip()))
	ofile.write(",\n")

ofile.write("    }\n")
ofile.write("    }\n")
ofile.write("}\n")

ifile.close()
ofile.close()

