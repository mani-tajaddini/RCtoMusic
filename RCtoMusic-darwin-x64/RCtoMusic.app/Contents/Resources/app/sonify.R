needs(reshape2)
needs(rlist)
needs(plotly)
needs(ggplot2)
needs(rlist)
needs(stringr)
needs(jsonlite)
needs(plyr)

inputString = input[1]
inputString = str_replace_all(inputString, fixed(" "), "")
inputString = tolower(inputString)

inputNotes = as.integer(unlist(str_split(input[2], " ")))

stringVector = unlist(strsplit(inputString, split = ""))

matrixDim = length(stringVector)

rcmatrix = matrix(nrow = matrixDim, ncol = matrixDim)
rcdf = data.frame()
REC = 0

for(i in 1:matrixDim){
  for(j in 1:matrixDim){
    if(stringVector[i] == stringVector[j]){
      REC = REC + 1
      rcmatrix[i, j] = 1
      if(i != j){
        rcdf = rbind(rcdf, c(i, j))
      }
    } else {
      rcmatrix[i, j] = 0
    }
  }
}

rcdf = data.frame(unique(t(apply(rcdf, 1, sort))))

names(rcdf) <- c("i", "j")

setList = list()
setList = list.append(setList, c(t(rcdf[1,])))
if(nrow(rcdf) > 1){
  for (i in 2:nrow(rcdf)) {
    rcpair = c(t(rcdf[i,]))
    for (j in 1:length(setList)) {
      inclusionVector = rcpair %in% setList[[j]]
      if(TRUE %in% inclusionVector){
        setList[[j]] = c(setList[[j]], rcpair[which(!(inclusionVector))])
        break
      } else if(j == length(setList)) {
        setList = list.append(setList, rcpair)
      }
    }
  }
}

for (i in (1:matrixDim)[which(!((1:matrixDim) %in% unlist(setList)))]) {
  setList = list.append(setList, i)
}

grouping = setList

makeNoteSequence <- function(mySetList, vectorOfNotes){
  if(length(mySetList) != length(vectorOfNotes)){
    stop("Length of Note vector should be equal to the number of groups in setList")
  }

  for (i in 1:length(vectorOfNotes)) {
    mySetList[[i]] = data.frame(place = mySetList[[i]], pitch = rep(vectorOfNotes[i], length(mySetList[[i]])))
  }

  return(mySetList)
}

setList = ldply(makeNoteSequence(setList, inputNotes))
setList = setList[order(setList$place),]
plotData = lapply(seq_len(nrow(rcmatrix)), function(i) rcmatrix[i,])
list("setList"=setList, "plotData"=plotData, "dataAxis"=as.character(1:matrixDim), "grouping"=grouping)