# def isPrime(n):
#     if n <= 1:
#         return False
#     for i in range(2, int(n**0.5) + 1):
#         if n % i == 0:
#             return False
#     return True
# primeNUmber=[]
# a=int(input("Enter a number: "))
# b=int(input("Enter a 2ndnumber: "))

# for i in range(a, b+1):
#     if isPrime(i):
#         primeNUmber.append(i)
# print(primeNUmber)

def display(a,b):
    for i in range(a, b+1):
        for j in range(2, int(i**0.5) + 1):
            if i % j == 0:
                break
        else:
            prime.append(i)
    return prime
prime=[]
a=int(input("Enter a number: "))
b=int(input("Enter a 2nd number: "))
prime=display(a,b)
print(prime)