var degToRad = Math.PI / 180.0;

/**
 * MyLamp
 * @constructor
 */
 function HalfSphere(scene, slices, stacks) {
 	CGFobject.call(this,scene);
	
	this.slices = slices;
	this.stacks = stacks;

 	this.initBuffers();
 };

 HalfSphere.prototype = Object.create(CGFobject.prototype);
 HalfSphere.prototype.constructor = HalfSphere;

 HalfSphere.prototype.initBuffers = function() {
     this.vertices = [];
     this.indices = [];
     this.normals = [];
	 this.texCoords = [];
     for (var lat = 0; lat <= this.stacks; lat++)
     {
         var theta = lat * Math.PI / this.stacks;
         
         for (var long = 0; long <= this.slices; long++)
         {
             var phi = long * Math.PI / this.slices;
             
             var x = Math.cos(phi) * Math.sin(theta);
             var y = Math.sin(phi) * Math.sin(theta);
             var z = Math.cos(theta);
             
             this.vertices.push(x, y, z);
			 this.texCoords.push(long/this.slices,lat/this.stacks);
         }
     }
     this.normals = this.vertices;
     
     for (var lat = 0; lat < this.stacks; lat++)
     {
         for (var long = 0; long < this.slices; long++)
         {
             var first = (lat * (this.slices+1)) + long;
             var second = first + this.slices + 1;
             this.indices.push(first, second, first+1);
             this.indices.push(second, second+1, first+1);
         }
     }
     this.primitiveType = this.scene.gl.TRIANGLES;
     this.initGLBuffers();
 };