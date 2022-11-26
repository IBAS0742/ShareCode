; /LONG,/L64,/SHORT,/FLOAT <- the type
; /SIGNED <- default is unsigned
;filename hdf 路径
;dataname 数据集
;helpTipPath 
PRO HdfToTiff,filename,dataname,helpTipPath, $
  tifFileName,data=data, $
  LONG=LONG,L64=l64,SHORT=SHORT,FLOAT=FLOAT,SIGNED=SIGNED
  openhdf,filename,dataname,Data=data
  out_name=FILE_DIRNAME(filename) + '\' + tifFileName
  Geo=READ_TIFF(helpTipPath, GEOTIFF=GeoRef)
  IF KEYWORD_SET(LONG) THEN BEGIN
    if KEYWORD_SET(SIGNED) THEN BEGIN
      ;_ex
      WRITE_TIFF, out_name, data, GEOTIFF=GeoRef,/LONG,/SIGNED
    endif else begin
      WRITE_TIFF, out_name, data, GEOTIFF=GeoRef,/LONG ; int32
    endelse
  ENDIF else IF KEYWORD_SET(L64) THEN BEGIN
    IF KEYWORD_SET(SIGNED) THEN BEGIN
      WRITE_TIFF, out_name, data, GEOTIFF=GeoRef,/L64,/SIGNED
    ENDIF ELSE BEGIN
      WRITE_TIFF, out_name, data, GEOTIFF=GeoRef,/L64 ; int64
    ENDELSE
  ENDIF ELSE IF KEYWORD_SET(SHORT) THEN BEGIN
    IF KEYWORD_SET(SIGNED) THEN BEGIN
      WRITE_TIFF, out_name, data, GEOTIFF=GeoRef,/SHORT,/SIGNED
    ENDIF ELSE BEGIN
      WRITE_TIFF, out_name, data, GEOTIFF=GeoRef,/SHORT ; int16
    ENDELSE
  ENDIF ELSE IF KEYWORD_SET(FLOAT) THEN BEGIN
    IF KEYWORD_SET(SIGNED) THEN BEGIN
      WRITE_TIFF, out_name, data, GEOTIFF=GeoRef,/FLOAT,/SIGNED
    ENDIF ELSE BEGIN
      WRITE_TIFF, out_name, data, GEOTIFF=GeoRef,/FLOAT
    ENDELSE
  ENDIF
END