import pandas as pd
import numpy as np
# import seaborn as sns
# import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, confusion_matrix # ,f1_score,recall_score,precision_score #模型验证
from sklearn.ensemble import RandomForestClassifier
from sklearn import svm
from sklearn.model_selection import GridSearchCV
# from sklearn.decomposition import PCA

import warnings
warnings.filterwarnings('ignore')

csvPath = r'.\penguins_size.csv'

# dearMethod = 'drop' 将 nan 行删除
#            = 'mean' 用 mean 填充
def getDatas(csvPath, dearMethod = 'drop', showDrop=False):
    datas = pd.read_csv(csvPath)
    xdata = []
    for i in range(2,5):
        xdata.append(datas.iloc[:,i].values.flatten())
    xdata = np.array(xdata).T
    # print(xdata[:5,:])

    sex_str = datas.iloc[:, 6].values.flatten()
    # sex = np.zeros(len(sex_str))
    sex = np.full(len(sex_str), np.nan)
    sex[sex_str == 'MALE'] = 1
    sex[sex_str == 'FEMALE'] = 2
    # print(len(sex))
    # 将含 nan 的行进行清除
    if dearMethod == 'drop':
        all = np.concatenate((xdata, sex.reshape((len(sex), 1))), axis=1)
        index = np.argwhere(np.isnan(all.mean(axis=1).flatten())).sum(axis=1).flatten()
        if showDrop:
            print("--------->  drop lines  <---------")
            print(all[index])
            print("-" * 20)
        xdata = np.delete(xdata, index, axis=0)
        sex = np.delete(sex, index, axis=0)
    elif dearMethod == 'mean':
        sex[np.isnan(sex)] = 1
        for i in range(0,3):
            xdata_l = xdata[:,i]
            xdata_l[np.isnan(xdata_l)] = xdata_l[np.logical_not(np.isnan(xdata_l))].mean(axis=0)
            xdata[:,i] = xdata_l
    return (xdata,sex)

class Train():
    def __init__(self, load_data_fn,test_size = 0.3):
        self.X,self.Y = load_data_fn()
        self.X_train, self.X_test, self.y_train, self.y_test = \
            train_test_split(self.X, self.Y, test_size=test_size)

    def conclusion(self, model):
        score = model.score(self.X_test, self.y_test)
        print(f"score = {score}")
        preds_pruned = model.predict(self.X_test)
        preds_pruned_train = model.predict(self.X_train)
        print(f"test data accuracy_score  : \t{accuracy_score(self.y_test, preds_pruned)}")
        print(f"train data accuracy_score : \t{accuracy_score(self.y_train, preds_pruned_train)}")
        conf_mat = confusion_matrix(self.y_test, preds_pruned)
        print(f"confusion_matrix : \n{conf_mat}")

    def KNeighborsClassifier(self):
        print("----> K Nearest Neighbours <----")
        knn = KNeighborsClassifier()
        knn.fit(self.X_train, self.y_train)  # 训练
        self.conclusion(knn)

    # 可以参考这个 https://www.cnblogs.com/panchuangai/p/13445819.html
    # 这个代码可以绘制出决策树的结构（跟那个 R 画出来的效果差不多，但是没他好看）
    def DecisionTreeClassifier(self):
        print("----> Decision tree/pruning  <----")
        clf = DecisionTreeClassifier(criterion = "gini", random_state = 100,
                               max_depth=3, min_samples_leaf=5)  # 初始化
        clf = clf.fit(self.X_train, self.y_train)  # 拟合
        self.conclusion(clf)

    # https://blog.csdn.net/littlle_yan/article/details/82663279
    def RandomForest(self):
        print("----> Random Forest <----")
        clf = RandomForestClassifier()
        clf.fit(self.X_train, self.y_train)
        self.conclusion(clf)

    # https://www.cnblogs.com/huanghanyu/p/13158838.html
    def SVM(self):
        print("----> Support Vector Machine  <----")
        # 设置参数候选项
        parameter_candidates = [
            {'C': [1, 10, 100, 1000], 'kernel': ['linear']},
            {'C': [1, 10, 100, 1000], 'gamma': [0.001, 0.0001], 'kernel': ['rbf']},
        ]
        # 使用参数候选项创建分类器
        clf = GridSearchCV(estimator=svm.SVC(), param_grid=parameter_candidates, n_jobs=-1)
        # 根据训练数据训练分类器
        clf.fit(self.X_train, self.y_train)
        self.conclusion(clf)

    # def PCA(self):
    #     estimator = PCA(n_components=2)
    #     X_pca = estimator.fit_transform(self.X)
    #     def plot_pca_scatter():
    #         colors = ['cyan', 'orange','green']
    #         for i in range(len(colors)):
    #             px = X_pca[:, 0][self.Y == i]
    #             py = X_pca[:, 1][self.Y == i]
    #             plt.scatter(px, py, c=colors[i])
    #         plt.legend(np.arange(0, 10).astype(str))
    #         plt.xlabel('First Principal Component')
    #         plt.ylabel('Second Principal Component')
    #         plt.show()
    #     plot_pca_scatter()
    #
    #     # 用SVM对据进行进行训练
    #     svc = svm.LinearSVC()  # 初始化线性核的支持向量机的分类器
    #     svc.fit(self.X_train,self.y_train)
    #     y_pred = svc.predict(self.X_test)
    #     # 用SVM对20维数据进行进行训练
    #     estimator = PCA(n_components=20)  # 使用PCA将原64维度图像压缩为20个维度
    #     pca_X_train = estimator.fit_transform(X_train)  # 利用训练特征决定20个正交维度的方向，并转化原训练特征
    #     pca_X_test = estimator.transform(X_test)


def load_data_fn():
    return getDatas(csvPath, "drop", showDrop=False)

train = Train(load_data_fn)
train.KNeighborsClassifier()
train.DecisionTreeClassifier()
train.RandomForest()
train.SVM()
# train.PCA()