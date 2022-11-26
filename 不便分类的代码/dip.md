```python
import cv2
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans

img = cv2.imread(r'.\MRA.pgm',-1)
plt.imshow(img)
plt.show()
kmeans=KMeans(n_clusters=3)
size = img.shape
size = size[0] * size[1]
kmeans.fit(np.array(img).reshape(size,1))
plt.imshow(kmeans.labels_.reshape(img.shape))
plt.show()
labs = kmeans.labels_
labs[labs < 2] = 1
plt.imshow(labs.reshape(img.shape))
plt.show()
```