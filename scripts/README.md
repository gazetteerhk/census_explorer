# Scripts

   * Run `data_preparation.py` to perform all pre-processing steps.
   * See `config.py` for configurations.

It takes about 5-10 min to run the full data preparation pipeline.
On my machine, it takes:

```
real    2m43.536s
user    3m38.576s
sys     1m11.936s
```

## Data Taxonomy

To make our discussion more communicable, this section notes down our taxonomy.

Different names:

- **Raw name** - what is found in the original database
- **Identifier** - what is found in our database
- **Canonical name** - what we present in the front end
- **Translation map** - mapping from identifier to canonical name

There are three versions of **Canonical name**: english, simplified, traditional.
They also have corresponding translation maps.

## Dependencies

### Python libraries

Those are included in `/requirements.txt`.

### GDAL

http://trac.osgeo.org/gdal/wiki/DownloadingGdalBinaries

### topojson

`npm install -g topojson`

