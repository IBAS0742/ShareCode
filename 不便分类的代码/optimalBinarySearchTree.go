// optimalBinarySearchTree([]int{1,2,3,4},[]float32{1,10,8,9})
// output: 
// 1	|	11	|	19	|	28	|	
// 0	|	10	|	18	|	27	|	
// 0	|	0	|	8	|	17	|	
// 0	|	0	|	0	|	9	|	
// result :  49
func optimalBinarySearchTree(k []int,w []float32) {
	kLen := len(k)
	var dp [][]float32 = make([][]float32,kLen)
	var sumW [][]float32 = make([][]float32,kLen)
	for i := 0;i < kLen;i++ {
		dp[i] = make([]float32,kLen)
		sumW[i] = make([]float32,kLen)
	}
	for i := 0;i < kLen;i++ {
		sumW[i][i] = w[i]
		for j := i + 1;j < kLen;j++ {
			sumW[i][j] = sumW[i][j - 1] + w[j]
		}
	}

	sum := kLen - 1
	for i := 0;i < kLen;i++ {
		dp[i][sum - i] = w[i]
	}
	var irj_dp = func(i,rj int) float32 {
		return dp[i][kLen - 1 - rj]
	}
	/*
	rj	0		1		2		3		...
	j	3		2		1		0		...
	0							w[0]	...
	1					w[1]	x		...
	2			w[2]	x		x		...
	3	w[3]	x		x		x		...
	...	...		...		...		...		...
	*/
	for s := kLen - 1;s > -1;s-- {
		for i := 0;i < s;i++ {
			// rj dp 数组中的位置(就是数组的索引) dp[i][rj]
			rj := s - i - 1
			// j 实际上我们要计算的范围，例如 (0~1) (0~3)
			j := kLen - s + i
			t := irj_dp(i,j - 1) // 索引转换
			if irj_dp(i + 1,j) < t {
				t = irj_dp(i + 1,j)
			}
			for r := i + 1; r < j;r++ {
				tt := irj_dp(i,r - 1) + irj_dp(r + 1,j)
				if tt < t {
					t = tt
				}
			}
			dp[i][rj] = t + sumW[i][j]
		}
	}

	//for i := 0;i < kLen;i++ {
	//	for j := 0;j < kLen;j++ {
	//		print(int(dp[i][j]))
	//		print("\t")
	//	}
	//	println()
	//}
	//println()
	for i := 0;i < kLen;i++ {
		for j := 0;j < kLen;j++ {
			print(int(sumW[i][j]))
			print("\t|\t")
		}
		println()
	}
	println("result : ",int(dp[0][0]))
}