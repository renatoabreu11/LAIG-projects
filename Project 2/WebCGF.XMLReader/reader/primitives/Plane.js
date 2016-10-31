/** Represents a plane with nrDivs divisions along both axis, with center at (0,0) */
function Plane(scene, dimX, dimY, partsX, partsY) {
    CGFobject.call(this,scene);

    // nrDivs = 1 if not provided
    nrDivs = typeof nrDivs !== 'undefined' ? nrDivs : 1;

    this.dimX = dimX;
    this.dimY = dimY;
    this.partsX = partsX;
    this.partsY = partsX
    this.lengthX = dimX / partsX;
    this.lengthY = dimY / partsY;
    this.minS = 0;
    this.maxS = 1;
    this.minT = 0;
    this.maxT = 1;

    this.initBuffers();
};

Plane.prototype = Object.create(CGFobject.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.initBuffers = function() {
    /* example for nrDivs = 3 :
     (numbers represent index of point in vertices array)

     y
     ^
     |
     0    1  |  2    3
     |
     4	 5	|  6    7
     --------|--------------> x
     8    9  |  10  11
     |
     12  13  |  14  15

     */

    // Generate vertices and normals
    this.vertices = [];
    this.normals = [];

    // Uncomment below to init texCoords
    this.texCoords = [];

    var yCoord = this.dimY / 2;

    this.incS = (this.maxS - this.minS) / this.partsX;
    this.incT = (this.maxT - this.minT) / this.partsY;

    for (var j = 0; j <= this.partsY; j++)
    {
        var xCoord = -this.dimX / 2;
        for (var i = 0; i <= this.partsX; i++)
        {
            this.vertices.push(xCoord, yCoord, 0);

            // As this plane is being drawn on the xy plane, the normal to the plane will be along the positive z axis.
            // So all the vertices will have the same normal, (0, 0, 1).

            this.normals.push(0,0,1);

            // texCoords should be computed here; uncomment and fill the blanks
            this.texCoords.push(this.minS + i * this.incS , this.minT + j * this.incT);
            xCoord += this.lengthX;
        }
        yCoord -= this.lengthY;
    }

    // Generating indices
    /* for nrDivs = 3 output will be
     [
     0,  4, 1,  5,  2,  6,  3,  7,
     7,  4,
     4,  8, 5,  9,  6, 10,  7, 11,
     11,  8,
     8, 12, 9, 13, 10, 14, 11, 15,
     ]
     Interpreting this index list as a TRIANGLE_STRIP will draw rows of the plane (with degenerate triangles in between. */

    this.indices = [];
    var ind=0;


    for (var j = 0; j < this.partsY; j++)
    {
        for (var i = 0; i <= this.partsX; i++)
        {
            this.indices.push(ind);
            this.indices.push(ind+this.partsX+1);

            ind++;
        }
        if (j+1 < this.partsY)
        {
            // Extra vertices to create degenerate triangles so that the strip can wrap on the next row
            // degenerate triangles will not generate fragments
            this.indices.push(ind+this.partsX);
            this.indices.push(ind);
        }
    }

    this.primitiveType = this.scene.gl.TRIANGLE_STRIP;

    /* Alternative with TRIANGLES instead of TRIANGLE_STRIP. More indices, but no degenerate triangles */
    /*
     for (var j = 0; j < this.nrDivs; j++)
     {
     for (var i = 0; i < this.nrDivs; i++)
     {
     this.indices.push(ind, ind+this.nrDivs+1, ind+1);
     this.indices.push(ind+1, ind+this.nrDivs+1, ind+this.nrDivs+2 );

     ind++;
     }
     ind++;
     }

     this.primitiveType = this.scene.gl.TRIANGLES;
     */

    this.initGLBuffers();
};