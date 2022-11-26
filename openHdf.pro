PRO DearHdf5,HdfPath,DataName,Data=Data,ShowInfo=showInfo
  IF KEYWORD_SET(showInfo) THEN BEGIN
    h5_list,hdfpath
  ENDIF

  data = H5_GETDATA(HdfPath, DataName)
END

PRO DearHdf4,HdfPath,DataName,Data=Data $
  ,Dims=Dims,ShowInfo=showInfo,map_info=map_info $
  ,type=type
  sd_id = HDF_SD_START(HdfPath, /READ)
  HDF_SD_FILEINFO,sd_id,nmfsds,attr
  IF KEYWORD_SET(showInfo) THEN BEGIN
    FOR i = 0,nmfsds - 1 DO BEGIN
      sds_id=HDF_SD_SELECT(sd_id,i)
      HDF_SD_GETINFO,sds_id,name=n,ndims=r,type=t,Dims=Dims
      PRINT,n,r,t
    ENDFOR
  ENDIF
  ;  IF KEYWORD_SET(Data) THEN BEGIN
  ; query layer index by layer name
  DataIndex = HDF_SD_NAMETOINDEX(sd_id,DataName)
  Result = HDF_SD_SELECT(sd_id, DataIndex)
  sds_id=HDF_SD_SELECT(sd_id,DataIndex)
  HDF_SD_GETINFO,sds_id,type=type,Dims=Dims
  HDF_SD_GETDATA, Result, Data
  ;  ENDIF
END

; OpenHdf,hdfpath,data,/showinfo
; OpenHdf,hdfpath,/showinfo
;PRO OpenHdf,HdfPath,DataName,_EXTRA=ex
PRO OpenHdf,HdfPath,DataName,Data=Data, $
  Dims=dim,ShowInfo=showInfo $
  ,map_info=map_info,type=type
  isHdf5 = H5F_IS_HDF5(HdfPath)
  isHdf4 = HDF_ISHDF(HdfPath)
  IF isHdf5 EQ 1 THEN BEGIN
    DearHdf5,HdfPath,DataName,Data=Data,ShowInfo=showInfo
  ENDIF ELSE IF isHdf4 EQ 1 THEN BEGIN
    DearHdf4,HdfPath,DataName,Data=Data, $
      Dims=dim,ShowInfo=showInfo,map_info=map_info, $
      type=type
  ENDIF ELSE BEGIN
    ; error
  ENDELSE
END