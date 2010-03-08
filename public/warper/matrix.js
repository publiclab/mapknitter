/**
 * Generic matrix class. Built for readability, not for speed.
 *
 * (c) Steven Wittens 2008
 * http://www.acko.net/
 */
var Matrix = function (w, h, values) {
  this.w = w;
  this.h = h;
  this.values = values || Matrix.allocate(h);
};

Matrix.allocate = function (w, h) {
  var values = [];
  for (var i = 0; i < h; ++i) {
    values[i] = [];
    for (var j = 0; j < w; ++j) {
      values[i][j] = 0;
    }
  } 
  return values; 
}

Matrix.cloneValues = function (values) {
  clone = [];
  for (var i = 0; i < values.length; ++i) {
    clone[i] = [].concat(values[i]);
  } 
  return clone; 
}

Matrix.prototype.add = function (operand) {
  if (operand.w != this.w || operand.h != this.h) {
    throw "Matrix add size mismatch";
  }

  var values = Matrix.allocate(this.w, this.h);
  for (var y = 0; y < this.h; ++y) {
    for (var x = 0; x < this.w; ++x) {
      values[y][x] = this.values[y][x] + operand.values[y][x];
    }
  }
  return new Matrix(this.w, this.h, values);
};

Matrix.prototype.transformProjectiveVector = function (operand) {
  var out = [];
  for (var y = 0; y < this.h; ++y) {
    out[y] = 0;
    for (var x = 0; x < this.w; ++x) {
      out[y] += this.values[y][x] * operand[x];
    }
  }
  var iz = 1 / (out[out.length - 1]);
  for (var y = 0; y < this.h; ++y) {
    out[y] *= iz;
  }
  return out;
}

Matrix.prototype.multiply = function (operand) {
  if (+operand !== operand) {
    // Matrix mult
    if (operand.h != this.w) {
      throw "Matrix mult size mismatch";
    }
    var values = Matrix.allocate(this.w, this.h);
    for (var y = 0; y < this.h; ++y) {
      for (var x = 0; x < operand.w; ++x) {
        var accum = 0;
        for (var s = 0; s < this.w; s++) {
          accum += this.values[y][s] * operand.values[s][x];
        }
        values[y][x] = accum;
      }
    }
    return new Matrix(operand.w, this.h, values);
  }
  else {
    // Scalar mult
    var values = Matrix.allocate(this.w, this.h);
    for (var y = 0; y < this.h; ++y) {
      for (var x = 0; x < this.w; ++x) {
        values[y][x] = this.values[y][x] * operand;
      }
    }
    return new Matrix(this.w, this.h, values);
  }
};

Matrix.prototype.rowEchelon = function () {
  if (this.w <= this.h) {
    throw "Matrix rowEchelon size mismatch";
  }
  
  var temp = Matrix.cloneValues(this.values);

  // Do Gauss-Jordan algorithm.
  for (var yp = 0; yp < this.h; ++yp) {
    // Look up pivot value.
    var pivot = temp[yp][yp];
    while (pivot == 0) {
      // If pivot is zero, find non-zero pivot below.
      for (var ys = yp + 1; ys < this.h; ++ys) {
        if (temp[ys][yp] != 0) {
          // Swap rows.
          var tmpRow = temp[ys];
          temp[ys] = temp[yp];
          temp[yp] = tmpRow;
          break;
        }
      }
      if (ys == this.h) {
        // No suitable pivot found. Abort.
        return new Matrix(this.w, this.h, temp);
      }
      else {
        pivot = temp[yp][yp];        
      }
    };
    // Normalize this row.
    var scale = 1 / pivot;
    for (var x = yp; x < this.w; ++x) {
      temp[yp][x] *= scale;
    }
    // Subtract this row from all other rows (scaled).
    for (var y = 0; y < this.h; ++y) {
      if (y == yp) continue;
      var factor = temp[y][yp];
      temp[y][yp] = 0;
      for (var x = yp + 1; x < this.w; ++x) {
        temp[y][x] -= factor * temp[yp][x];
      }
    }
  }  

  return new Matrix(this.w, this.h, temp);
}

Matrix.prototype.invert = function () {
  if (this.w != this.h) {
    throw "Matrix invert size mismatch";
  }

  var temp = Matrix.allocate(this.w * 2, this.h);

  // Initialize augmented matrix
  for (var y = 0; y < this.h; ++y) {
    for (var x = 0; x < this.w; ++x) {
      temp[y][x] = this.values[y][x];
      temp[y][x + this.w] = (x == y) ? 1 : 0;
    }
  }
  
  temp = new Matrix(this.w * 2, this.h, temp);
  temp = temp.rowEchelon();
  
  // Extract right block matrix.
  var values = Matrix.allocate(this.w, this.h);
  for (var y = 0; y < this.w; ++y) {
    for (var x = 0; x < this.w; ++x) {
      values[y][x] = temp.values[y][x + this.w];
    }
  }
  return new Matrix(this.w, this.h, values);
};

Matrix.prototype.print = function () {
  var out = "<table>";
  for (var y = 0; y < this.h; ++y) {
    out += '<tr>';
    for (var x = 0; x < this.w; ++x) {
      out += '<td>';
      out += Math.round(this.values[y][x] * 100.0) / 100.0;
      out += '</td>';
    }
    out += '</tr>';
  }
  out += '</table>';
  $('body').append(out);
  
  return this;
};

