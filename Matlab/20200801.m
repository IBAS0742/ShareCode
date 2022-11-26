t = [1:10];
colorStrs = ['y','m','c','r','g','b','w','k'];
for t1=1:5
    grid on
    x = rand(10,3);
    plot(t,x(:,1),'--',t,x(:,2),'-',t,x(:,3),'-+','color',colorStrs(t1));
    hold on
end
figure;
t = [1:10];
colors = [[1 1 0];[1 0 1];[0 1 1];[1 0 0];[0 1 0];[0 0 1]];
for t1=1:5
    grid on
    x = rand(10,3);
    plot(t,x(:,1),'--',t,x(:,2),'-',t,x(:,3),'-+','color',colors(t1,:));
    hold on
end